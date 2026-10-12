import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

test('website generation removes obsolete downloads and standards sources', async () => {
  const root = new URL('../../', import.meta.url)
  const outputs = ['downloads', 'sources'].map(folder => new URL(`apps/website/public/${folder}/`, root))

  for (const folder of outputs) {
    await mkdir(folder, { recursive: true })

    await writeFile(new URL('obsolete-way-regression.txt', folder), 'removed canonical input')
  }

  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build-website-sources.mjs', root))])

  for (const folder of outputs)
    await assert.rejects(access(new URL('obsolete-way-regression.txt', folder)), { code: 'ENOENT' })

  const template = await readFile(new URL('templates/README-library.md', root), 'utf8')

  assert.equal(await readFile(new URL('README-library.md', outputs[0]), 'utf8'), template)
})
