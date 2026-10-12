import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('release audit requires an actual version command rather than a Node version setting', async t => {
  const root = await mkdtemp(join(tmpdir(), 'way-release-audit-'))

  t.after(() => rm(root, { recursive: true, force: true }))

  const scripts = join(root, 'way', 'scripts')
  const script = join(scripts, 'audit-release-workflows.mjs')
  const repository = join(root, 'example')
  const workflows = join(repository, '.github', 'workflows')

  await mkdir(join(scripts, 'lib'), { recursive: true })

  await cp(new URL('../audit-release-workflows.mjs', import.meta.url), script)

  await cp(new URL('./release-families.mjs', import.meta.url), join(scripts, 'lib', 'release-families.mjs'))

  await mkdir(join(repository, '.git'), { recursive: true })

  await mkdir(workflows, { recursive: true })

  for (const [versionLine, expectedStatus] of [
    ['', 1],
    ['          # version: pnpm changeset version', 1],
    ['          version: pnpm changeset version', 0],
    ['          version-script: pnpm changeset version', 0]
  ]) {
    await writeFile(join(workflows, 'release.yml'), [
      'name: Release',
      'on: workflow_dispatch',
      'permissions:',
      '  pull-requests: write',
      'jobs:',
      '  release:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/setup-node@v6',
      '        with:',
      '          node-version: 22',
      '      - uses: changesets/action@v1',
      '        with:',
      versionLine,
      '        env:',
      '          GITHUB_TOKEN: ${{ github.token }}'
    ].join('\n'))

    const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' })

    assert.equal(result.status, expectedStatus, `${versionLine}\n${result.stdout}\n${result.stderr}`)

    if (expectedStatus === 1) assert.match(result.stdout, /version command/u)
    else assert.match(result.stdout, /example.*none/u)
  }
})
