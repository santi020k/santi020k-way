import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { classifyReleaseFamilies } from './release-families.mjs'

await test('release audit retains independent package and deployment families', () => {
  assert.equal(classifyReleaseFamilies([
    { content: 'workflow_dispatch:\nrun: node scripts/publish-release.mjs' },
    { content: 'workflow_dispatch:\nrun: wrangler deploy' }
  ]), 'deployment, manual-release')

  assert.equal(classifyReleaseFamilies([{ content: 'changesets/action@v1\nrun: wrangler deploy' }]), 'changesets, deployment')

  assert.equal(classifyReleaseFamilies([]), 'none')

  assert.equal(classifyReleaseFamilies([{ content: 'run: pnpm check' }]), 'automation-only')
})

await test('release audit recognizes the canonical changesets release template', async () => {
  const content = await readFile(new URL('../../templates/changesets-release.yml', import.meta.url), 'utf8')

  assert.equal(classifyReleaseFamilies([{ content }]), 'manual-release')
})
