import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'

import { getStandard, readCatalog, searchStandards } from '../dist/catalog.js'

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
