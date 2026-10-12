import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'

import { buildWebsiteSources } from './website-sources.mjs'

test('website regeneration removes retired sources and templates while preserving static assets', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'way-website-sources-'))

  t.after(() => rm(directory, { recursive: true, force: true }))

  const root = pathToFileURL(`${directory}/`)
  const templates = new URL('templates/', root)
  const publicRoot = new URL('apps/website/public/', root)

  await mkdir(templates, { recursive: true })

  await mkdir(publicRoot, { recursive: true })

  await writeFile(new URL('favicon.svg', publicRoot), 'static asset')

  await writeFile(new URL('old.md', templates), 'old template')

  await buildWebsiteSources(root, [{ id: 'retired', content: 'old guidance' }])

  await rm(new URL('old.md', templates))

  await writeFile(new URL('current.md', templates), 'current template')

  for (let run = 0; run < 2; run++) {
    await buildWebsiteSources(root, [{ id: 'current', content: 'current guidance' }])

    assert.deepEqual(await readdir(new URL('sources/', publicRoot)), ['current.md'])

    assert.deepEqual(await readdir(new URL('downloads/', publicRoot)), ['current.md'])

    assert.equal(await readFile(new URL('sources/current.md', publicRoot), 'utf8'), 'current guidance')

    assert.equal(await readFile(new URL('downloads/current.md', publicRoot), 'utf8'), 'current template')

    assert.equal(await readFile(new URL('favicon.svg', publicRoot), 'utf8'), 'static asset')
  }
})
