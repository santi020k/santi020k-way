import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const publisher = fileURLToPath(new URL('../publish-release.mjs', import.meta.url))
const commit = 'a'.repeat(40)

const fixture = async (t, releaseStatus, registryStatus = 404, failedCommand) => {
  const root = await mkdtemp(join(tmpdir(), 'way-publication-'))

  t.after(() => rm(root, { recursive: true, force: true }))

  const bin = join(root, 'bin')
  const npmMarker = join(root, 'npm-published')
  const githubMarker = join(root, 'github-published')
  const preload = join(root, 'fetch.mjs')
  const attempt = join(root, 'failed-attempt')

  await mkdir(bin)

  await mkdir(join(root, 'packages/way'), { recursive: true })

  await writeFile(join(root, 'packages/way/package.json'), JSON.stringify({ version: '0.1.0' }))

  const fake = async (name, content) => writeFile(
    join(bin, name), `#!${process.execPath}\n${content}\n`, { mode: 0o755 }
  )

  await fake('git', `console.log(process.argv[2] === 'ls-remote' ? '${commit}\\trefs/tags/v0.1.0' : '${commit}')`)

  const failOnce = command => failedCommand === command ?
    `
if (!existsSync(${JSON.stringify(attempt)})) {
  writeFileSync(${JSON.stringify(attempt)}, 'attempted');
  process.exit(1);
}
` :
    ''

  await fake('npm', `
import { appendFileSync, existsSync, writeFileSync } from 'node:fs';
${failOnce('npm')}
appendFileSync(${JSON.stringify(npmMarker)}, 'published\\n');
`)

  await fake('gh', `
import { existsSync, writeFileSync } from 'node:fs';
${failOnce('gh')}
writeFileSync(${JSON.stringify(githubMarker)}, 'published');
`)

  await writeFile(preload, `
import { existsSync } from 'node:fs';
globalThis.fetch = async input => {
  const url = String(input);
  if (url.startsWith('https://api.github.com/repos/test/way/releases/tags/'))
    return Response.json({ assets: [] }, { status: ${releaseStatus} });
  if (url.startsWith('https://registry.npmjs.org/'))
    return existsSync(${JSON.stringify(npmMarker)})
      ? Response.json({ gitHead: '${commit}' })
      : Response.json({}, { status: ${registryStatus} });
  throw new Error('Unexpected network request: ' + url);
};
`)

  const run = () => spawnSync(process.execPath, ['--import', preload, publisher], {
    cwd: root,
    env: {
      ...process.env,
      PATH: bin,
      GITHUB_ACTIONS: 'true',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_SHA: commit,
      GITHUB_REPOSITORY: 'test/way',
      GH_TOKEN: 'test-token',
      WAY_PUBLISH_NPM: 'true'
    },
    encoding: 'utf8'
  })

  return { run, npmMarker, githubMarker }
}

test('an incomplete existing GitHub release blocks npm publication', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 200)
  const result = run()

  assert.notEqual(result.status, 0)

  assert.match(result.stderr, /Existing release is incomplete/u)

  await assert.rejects(access(npmMarker), { code: 'ENOENT' })

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })
})

test('a verified absent release publishes npm and GitHub from the checked commit', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 404)
  const result = run()

  assert.equal(result.status, 0, result.stderr)

  await access(npmMarker)

  await access(githubMarker)

  assert.match(result.stdout, /Verified immutable release/u)
})

test('registry verification failures block GitHub publication', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 404, 503)
  const result = run()

  assert.notEqual(result.status, 0)

  assert.match(result.stderr, /Cannot verify npm release state/u)

  await assert.rejects(access(npmMarker), { code: 'ENOENT' })

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })
})

test('GitHub verification failures block npm publication', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 503)
  const result = run()

  assert.notEqual(result.status, 0)

  assert.match(result.stderr, /Cannot verify GitHub release state/u)

  await assert.rejects(access(npmMarker), { code: 'ENOENT' })

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })
})

test('an existing npm version without matching provenance blocks GitHub publication', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 404, 200)
  const result = run()

  assert.notEqual(result.status, 0)

  assert.match(result.stderr, /different or missing source provenance/u)

  await assert.rejects(access(npmMarker), { code: 'ENOENT' })

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })
})

test('a failed GitHub creation can be retried without republishing the existing npm version', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 404, 404, 'gh')
  const failed = run()

  assert.notEqual(failed.status, 0)

  assert.equal(await readFile(npmMarker, 'utf8'), 'published\n')

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })

  const retried = run()

  assert.equal(retried.status, 0, retried.stderr)

  assert.match(retried.stdout, /Matching npm version already exists/u)

  assert.equal(await readFile(npmMarker, 'utf8'), 'published\n')

  await access(githubMarker)
})

test('a failed npm command blocks GitHub creation and a retry completes publication', async t => {
  const { run, npmMarker, githubMarker } = await fixture(t, 404, 404, 'npm')
  const failed = run()

  assert.notEqual(failed.status, 0)

  await assert.rejects(access(npmMarker), { code: 'ENOENT' })

  await assert.rejects(access(githubMarker), { code: 'ENOENT' })

  const retried = run()

  assert.equal(retried.status, 0, retried.stderr)

  assert.equal(await readFile(npmMarker, 'utf8'), 'published\n')

  await access(githubMarker)
})
