import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const pkg = JSON.parse(await readFile(new URL('packages/way/package.json', root), 'utf8'))

if (!/^\d+\.\d+\.\d+$/u.test(pkg.version)) throw new Error('Release version must be stable semver.')

const output = new URL('dist/', root)

await mkdir(output, { recursive: true })

const archives = []

for (const host of ['codex', 'claude']) {
  const name = `santi020k-way-${host}-${pkg.version}.tgz`

  execFileSync('tar', ['-czf', fileURLToPath(new URL(name, output)), '-C', fileURLToPath(new URL(`packages/plugin/dist/${host}`, root)), '.'])

  archives.push(name)
}

execFileSync('pnpm', ['--dir', fileURLToPath(new URL('packages/way/', root)), 'pack', '--pack-destination', fileURLToPath(output)], { stdio: 'inherit' })

archives.push(`santi020k-way-${pkg.version}.tgz`)

const sums = await Promise.all(archives.map(async name => {
  const content = await readFile(new URL(name, output))

  return `${createHash('sha256').update(content).digest('hex')}  ${name}`
}))

await writeFile(new URL('SHA256SUMS', output), `${sums.join('\n')}\n`)

console.log(`Packaged ${archives.length} versioned archives with SHA-256 checksums.`)
