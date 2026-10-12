import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'

import { getStandard, readCatalog, searchStandards } from '../dist/catalog.js'
import { catalogMetadataSchema, parseCatalog, standardSchema } from '../dist/catalog-schema.js'

await test('every catalog record has verifiable provenance and unique identity', () => {
  const catalog = readCatalog()

  assert.equal(
    new Set(catalog.entries.map(entry => entry.id)).size, catalog.entries.length
  )

  for (const entry of catalog.entries) {
    assert.equal(
      createHash('sha256').update(entry.content).digest('hex'), entry.contentHash
    )

    assert.ok(entry.scope.length > 0)

    assert.ok(entry.source.endsWith('.md'))
  }
})

await test('search retrieves the relevant standard without returning every full manual', () => {
  const results = searchStandards('design', 3)

  assert.ok(results[0])

  assert.equal(results[0].id, 'design')

  assert.ok(results.every(entry => !('content' in entry)))

  assert.equal(getStandard(results[0].id).kind, 'standard')

  assert.deepEqual(searchStandards('xyz-nonexistent-standard'), [])

  assert.throws(() => getStandard('../../etc/passwd'), /Unknown standard/u)

  assert.throws(() => searchStandards(' '))

  assert.throws(() => searchStandards('design', 0))

  assert.throws(() => searchStandards('x'.repeat(201)))
})

await test('tool names and aliases retrieve the package usage guide', () => {
  for (const query of [
    'Lumen',
    'Theme',
    'ESLint Config Basic',
    'Quality',
    'Astro Doctor',
    'astro-doctor',
    'Commitprompt',
    'Dep Beacon',
    'dep-beacon',
    'OG',
    'Open Graph',
    'santi-og',
    'Auth'
  ]) {
    const match = searchStandards(query).find(entry => entry.id === 'packages')

    assert.ok(match, `Missing tool usage guide for ${query}`)

    assert.equal(getStandard(match.id).source, 'standards/packages.md')
  }
})

await test('catalog validation rejects tampering and malformed source metadata', () => {
  const catalog = readCatalog()
  const entry = catalog.entries[0]

  assert.ok(entry)

  for (const change of [
    { content: `${entry.content} changed` },
    { contentHash: '0'.repeat(64) },
    { id: '../../escape' },
    { source: 'standards/../private.md' },
    { source: '/absolute.md' },
    { source: 'https://example.com/file.md' },
    { source: 'standards//file.md' },
    { reviewedAt: '2026-02-30' },
    { title: '' },
    { tags: [] }
  ]) {
    assert.throws(() => standardSchema.parse({ ...entry, ...change }))
  }

  assert.throws(() => parseCatalog({ ...catalog, hash: '0'.repeat(64) }), /Catalog hash/u)

  assert.throws(() => parseCatalog({ ...catalog, entries: [...catalog.entries, entry] }), /unique/u)

  assert.throws(() => catalogMetadataSchema.parse(catalog.entries.filter(item => item.id !== 'core')), /core/u)

  assert.deepEqual(parseCatalog(catalog), catalog)
})
