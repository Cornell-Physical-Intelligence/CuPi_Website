import { lstatSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const MASTERS = resolve(ROOT, 'asset-masters')
const LEGACY_MASTERS = resolve(MASTERS, 'legacy')

const LEGACY_PUBLIC_PATHS = [
  'oracle_fpv.gif',
  'img/DroneFlipped.png',
  'img/Hexapod.png',
  'img/LegFlipped.png',
  'img/LegRender.png',
  'img/PCBModule.png',
  'img/PlaneBottom.png',
  'img/PlaneNoseCone.png',
  'img/Quad.png',
  'img/SpinAnimation.mp4',
  'img/SwallowProject.png',
  'img/WorkPage/DetailedSymbiotePicture.png',
  'img/WorkPage/SymbioteOrtho.png',
  'img/WorkPage/SymbioteOrthoMobile.png',
]

const filesUnder = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Production asset verification failed: ${relative(ROOT, path)} is a link`)
    }
    return entry.isDirectory() ? filesUnder(path) : [path]
  })

const masters = filesUnder(MASTERS).filter((path) => relative(MASTERS, path) !== 'README.md')
let sourceBytes = 0
for (const master of masters) {
  const path = relative(MASTERS, master)
  sourceBytes += lstatSync(master).size
  for (const servedRoot of ['public', 'docs']) {
    const servedPath = resolve(ROOT, servedRoot, path)
    try {
      lstatSync(servedPath)
      throw new Error(
        `Production asset verification failed: source master leaked into ${relative(ROOT, servedPath)}`,
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

const legacyMasters = filesUnder(LEGACY_MASTERS).map((path) => relative(LEGACY_MASTERS, path))
const unexpectedLegacyMasters = legacyMasters.filter((path) => !LEGACY_PUBLIC_PATHS.includes(path))
const missingLegacyMasters = LEGACY_PUBLIC_PATHS.filter((path) => !legacyMasters.includes(path))

if (unexpectedLegacyMasters.length || missingLegacyMasters.length) {
  throw new Error(
    'Production asset verification failed: legacy inventory does not match its allowlist' +
      `\n  missing: ${missingLegacyMasters.join(', ') || 'none'}` +
      `\n  unexpected: ${unexpectedLegacyMasters.join(', ') || 'none'}`,
  )
}

for (const path of LEGACY_PUBLIC_PATHS) {
  for (const servedRoot of ['public', 'docs']) {
    const servedPath = resolve(ROOT, servedRoot, path)
    try {
      lstatSync(servedPath)
      throw new Error(
        `Production asset verification failed: legacy asset leaked into ${relative(ROOT, servedPath)}`,
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

console.log(
  `Production asset verification passed: ${masters.length} source masters ` +
    `(${(sourceBytes / 1024 / 1024).toFixed(1)} MB) remain outside public/ and docs/; ` +
    `${LEGACY_PUBLIC_PATHS.length} retired assets are excluded from their former public paths.`,
)
