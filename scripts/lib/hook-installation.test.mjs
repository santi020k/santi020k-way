import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const installer = fileURLToPath(new URL('../install-quality-hooks.mjs', import.meta.url))

await test('hook setup handles CI, archives, missing/outdated tools, and installation failures', async () => {
  const root = await mkdtemp(join(tmpdir(), 'way-hooks-'))
  const bin = join(root, 'bin')
  const log = join(root, 'installed')

  try {
    await mkdir(bin)

    const env = { ...process.env, CI: '', PATH: bin }
    const run = (...args) => spawnSync(process.execPath, [installer, ...args], { cwd: root, env, encoding: 'utf8' })
    const fake = async (name, body) => writeFile(join(bin, name), `#!${process.execPath}\n${body}\n`, { mode: 0o755 })

    // CI bypasses Git and Quality altogether; archives skip only automatic setup.
    assert.equal(spawnSync(process.execPath, [installer], { cwd: root, env: { ...env, CI: 'true' } }).status, 0)

    assert.equal(run('--automatic').status, 0)

    assert.notEqual(run().status, 0)

    await fake('git', 'console.log(process.cwd())')

    assert.equal(run('--automatic').status, 0)

    assert.match(run().stderr, /Install Quality CLI/u)

    assert.equal(run().status, 1)

    await fake('quality', 'console.log(\'quality 1.1.0\')')

    assert.equal(run('--automatic').status, 0)

    assert.equal(run().status, 1)

    await fake('quality', `import { writeFileSync } from 'node:fs'; if (process.argv[2] === '--version') console.log('quality 1.3.0'); else writeFileSync(${JSON.stringify(log)}, process.argv.slice(2).join(' '))`)

    assert.equal(run().status, 0)

    assert.equal(await readFile(log, 'utf8'), 'hooks install')

    await fake('quality', 'if (process.argv[2] === \'--version\') console.log(\'quality 1.3.0\'); else process.exit(1)')

    assert.notEqual(run('--automatic').status, 0, 'Hook conflicts must fail even during automatic setup')

    await fake('quality', 'process.exit(1)')

    assert.notEqual(run('--automatic').status, 0, 'A broken tool must not be treated as missing')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

await test('hook setup does not treat a nested source archive as its enclosing repository', async t => {
  const root = await mkdtemp(join(tmpdir(), 'way-nested-archive-'))

  t.after(() => rm(root, { recursive: true, force: true }))

  const archive = join(root, 'source-archive')
  const bin = join(root, 'bin')
  const log = join(root, 'installed')

  const fixtureEnvironment = {
    ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_'))),
    CI: '',
    PATH: `${bin}${delimiter}${process.env.PATH}`
  }

  await mkdir(archive)

  await mkdir(bin)

  execFileSync('git', ['init', '--quiet', root], { env: fixtureEnvironment })

  await writeFile(join(bin, 'quality'), `#!${process.execPath}\nimport { writeFileSync } from 'node:fs'; if (process.argv[2] === '--version') console.log('quality 1.3.0'); else writeFileSync(${JSON.stringify(log)}, 'installed')\n`, { mode: 0o755 })

  const run = (...args) => spawnSync(process.execPath, [installer, ...args], {
    cwd: archive,
    env: fixtureEnvironment,
    encoding: 'utf8'
  })

  const automatic = run('--automatic')

  assert.equal(automatic.status, 0, automatic.stderr)

  await assert.rejects(readFile(log), { code: 'ENOENT' })

  const explicit = run()

  assert.equal(explicit.status, 1)

  assert.match(explicit.stderr, /repository root/u)

  await assert.rejects(readFile(log), { code: 'ENOENT' })

  const owningRoot = spawnSync(process.execPath, [installer], {
    cwd: root,
    env: fixtureEnvironment,
    encoding: 'utf8'
  })

  assert.equal(owningRoot.status, 0, owningRoot.stderr)

  assert.equal(await readFile(log, 'utf8'), 'installed')
})
