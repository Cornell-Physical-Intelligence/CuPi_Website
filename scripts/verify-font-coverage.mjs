import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import { PARAM_GROUPS, TOGGLES } from '../src/components/voronoiConfig.js'
import { REPORT_METADATA } from '../src/data/reportMetadata.js'
import { PROFESSORS, TEAM_SECTIONS } from '../src/data/team.js'
import { WORK_AREAS } from '../src/data/workAreas.js'
import { PAGE_SEO } from '../src/seoBuild.js'

const ROOT = new URL('../', import.meta.url)
const fromRoot = (path) => new URL(path, ROOT)
const read = (path) => readFileSync(fromRoot(path))
const readText = (path) => read(path).toString('utf8')
const sha256 = (path) => createHash('sha256').update(read(path)).digest('hex')

// These hashes bind the coverage declarations below to the exact binaries that carry
// them. A new font file therefore cannot quietly land without this audit being revisited.
const EXPECTED_FONTS = {
  'playfair-display-700-latin.woff2': {
    bytes: 2176,
    sha256: 'af9608dbec733485660e0114f83988ca1d4a2c61cac98bc969e91a300bac36f6',
  },
  'questrial-400-latin.woff2': {
    bytes: 8168,
    sha256: '038093baeda6cea0da9a8947ceba44194b2ab3daf22df952e3e544a7df4a7948',
  },
}

const EXPECTED_SOURCES = {
  'playfair-display-700-latin-full.woff2':
    '02af2688dd8c8a55069e99bba3f5c70c67c8f7fb0b7fca9c4fc40c4ffc474d06',
  'questrial-400-latin-full.woff2':
    '1f4e551b571201073ff09a40f80e2b47b1c25955464fc7ebbcb5ca8347942f70',
}

const fail = (message) => {
  throw new Error(`Font coverage verification failed: ${message}`)
}

for (const [file, expected] of Object.entries(EXPECTED_FONTS)) {
  for (const folder of ['public/fonts', 'docs/fonts']) {
    const path = `${folder}/${file}`
    const bytes = read(path).byteLength
    const digest = sha256(path)
    if (bytes !== expected.bytes || digest !== expected.sha256) {
      fail(`${path} is not the reviewed ${expected.bytes}-byte subset (${digest})`)
    }
  }
}

for (const [file, expected] of Object.entries(EXPECTED_SOURCES)) {
  const path = `font-sources/${file}`
  if (sha256(path) !== expected) fail(`${path} no longer matches its licensed full source`)
}

const printableAscii = Array.from({ length: 0x7f - 0x20 }, (_, index) =>
  String.fromCodePoint(0x20 + index),
)
const questrialCoverage = new Set([
  ...printableAscii,
  '·', // report eyebrow separators
  '×', // dev close control
  '–',
  '—', // dev preset help
  '‘',
  '’',
  '•',
  '…',
])
const playfairCoverage = new Set('CUPITantalus')

// These two characters were already absent from the full Google Fonts Latin file, so
// Chrome has always drawn them with the declared system fallback. Keeping that behavior
// is required for pixel parity; adding a new intentional fallback must be reviewed here.
const questrialIntentionalFallback = new Set(['σ', '⚙'])

const collectStaticStrings = (path) => {
  const ast = parse(readText(path), {
    sourceType: 'module',
    plugins: ['jsx', 'importMeta', 'topLevelAwait'],
  })
  const values = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'StringLiteral') values.push(node.value)
    if (node.type === 'JSXText') values.push(node.value)
    if (node.type === 'TemplateElement') values.push(node.value.cooked ?? '')
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end'].includes(key)) continue
      if (Array.isArray(value)) value.forEach(walk)
      else walk(value)
    }
  }
  walk(ast)
  return values
}

const assertCovered = (family, labels, coverage, intentionalFallback = new Set()) => {
  for (const [label, value] of labels) {
    for (const character of String(value ?? '')) {
      if (/\s/u.test(character)) continue
      if (coverage.has(character) || intentionalFallback.has(character)) continue
      const code = `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      fail(`${family} needs unsupported ${JSON.stringify(character)} (${code}) in ${label}`)
    }
  }
}

const sourceStrings = (path) =>
  collectStaticStrings(path).map((value, index) => [`${path} static string ${index + 1}`, value])

// Every production selector that names Questrial is represented here, along with the
// dev-only controls that use the same face. Dynamic labels are read from their data
// sources instead of copied into this verifier, so changing a role, report, or work-area
// title immediately exercises the guard.
const questrialText = [
  ...sourceStrings('src/App.jsx'),
  ...sourceStrings('src/components/Controls.jsx'),
  ...sourceStrings('src/components/SiteFooter.jsx'),
  ['Gallery section label', 'Gallery'],
  ['Reports section label', 'Technical Reports'],
  ['Latest reports section label', 'Latest technical reports'],
  ['Missing portrait label', 'photo coming soon'],
  ['Report eyebrow', 'CUPI Technical Report · Updated'],
  ...PARAM_GROUPS.flatMap((group) => [
    ['Control group', group.title],
    ['Control note', group.note],
    ...group.params.map((parameter) => ['Control parameter', parameter.label]),
  ]),
  ...TOGGLES.map((toggle) => ['Control toggle', toggle.label]),
  ...WORK_AREAS.map((area) => ['Work section label', area.title]),
  ...TEAM_SECTIONS.flatMap((section) =>
    section.members.flatMap((member) => [
      ['Member role', member.role],
      ['Member metadata', member.meta],
      ['Member year', member.year],
    ]),
  ),
  ...PROFESSORS.flatMap((member) => [
    ['Faculty role', member.role],
    ['Faculty metadata', member.meta],
    ['Faculty year', member.year],
  ]),
  ...REPORT_METADATA.flatMap((report) => [
    ['Report year', report.year],
    ['Report author', report.authors],
    ['Report modified label', report.lastModifiedLabel],
  ]),
]
assertCovered(
  'Questrial',
  questrialText,
  questrialCoverage,
  questrialIntentionalFallback,
)

const sponsorsSource = readText('src/pages/Sponsors.jsx')
const sponsorArray = sponsorsSource.match(/const SPONSORS = \[([\s\S]*?)\n\];/)?.[1]
if (!sponsorArray) fail('could not find the sponsor definition used by SponsorMark')
const generatedSponsorNames = [...sponsorArray.matchAll(/\{\s*name:\s*'([^']+)'[^}]*\}/g)]
  .filter((match) => !/\b(?:art|logo):/.test(match[0]))
  .map((match) => match[1])
if (!generatedSponsorNames.length) fail('could not find any text-generated sponsor marks')

const homeSource = readText('src/pages/Home.jsx')
const heroWords = [...homeSource.matchAll(/<VoronoiTitle\b[^>]*\btext="([^"]+)"/g)].map(
  (match) => match[1],
)
if (!heroWords.length) fail('could not find the Playfair-backed Voronoi hero word')
assertCovered(
  'Playfair Display',
  [
    ...heroWords.map((word) => ['Voronoi hero', word]),
    ...generatedSponsorNames.map((name) => ['Generated sponsor mark', name]),
  ],
  playfairCoverage,
)

// The static SEO fallback and both navigation systems intentionally use system/Arial,
// not either subset face. Assert that boundary so all of PAGE_SEO can retain unrestricted
// language without silently expanding the webfont contract.
const indexHtml = readText('index.html')
const appCss = readText('src/App.css')
if (!/\.seo-fallback\s*\{[\s\S]*?font-family:\s*system-ui/.test(indexHtml)) {
  fail('the generated static SEO fallback is no longer pinned to a system font')
}
if (!/\.menu-item\s*\{[\s\S]*?font-family:\s*Arial/.test(appCss)) {
  fail('the interactive navigation is no longer pinned to Arial')
}
if (Object.keys(PAGE_SEO).length < 8) fail('the complete static SEO route map was not loaded')

console.log(
  `Font coverage verified: ${questrialText.length} Questrial text sources, ` +
    `${heroWords.length} hero word, ${generatedSponsorNames.length} generated sponsor mark, ` +
    'and 4 reviewed font binaries.',
)
