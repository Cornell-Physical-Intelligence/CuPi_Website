import { lstatSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const MASTERS = resolve(ROOT, 'asset-masters')

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

console.log(
  `Production asset verification passed: ${masters.length} source masters ` +
    `(${(sourceBytes / 1024 / 1024).toFixed(1)} MB) remain outside public/ and docs/.`,
)
