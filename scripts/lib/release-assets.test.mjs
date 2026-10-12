import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { sha256, verifyReleaseAssets } from './release-assets.mjs'

test('release retries verify remote sizes, checksums and checked source payloads', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'way-release-assets-'))

  try {
    const archive = async content => {
      await writeFile(join(directory, 'source.txt'), content)

      execFileSync('tar', ['-czf', join(directory, 'package.tgz'), '-C', directory, 'source.txt'])

      return readFile(join(directory, 'package.tgz'))
    }

    const fresh = await archive('checked source')
    const stale = await archive('stale source')

    const remote = new Map([
      ['package.tgz', fresh],
      ['SHA256SUMS', Buffer.from(`${sha256(fresh)}  package.tgz\n`)]
    ])

    const assets = [...remote].map(([name, content]) => ({ name, size: content.length }))
    const local = new Map([['package.tgz', fresh]])

    assert.doesNotThrow(() => verifyReleaseAssets(assets, local, remote))

    const invalidSizes = assets.map(asset => ({ ...asset, size: 0 }))

    assert.throws(() => verifyReleaseAssets(invalidSizes, local, remote), /size mismatch/u)

    assert.throws(() => verifyReleaseAssets(assets, local, new Map([['package.tgz', stale], ['SHA256SUMS', remote.get('SHA256SUMS')]])), /size mismatch|checksum mismatch/u)

    const staleRemote = new Map([
      ['package.tgz', stale],
      ['SHA256SUMS', Buffer.from(`${sha256(stale)}  package.tgz\n`)]
    ])

    const staleAssets = [...staleRemote].map(([name, content]) => ({ name, size: content.length }))

    assert.throws(() => verifyReleaseAssets(staleAssets, local, staleRemote), /payload differs/u)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
