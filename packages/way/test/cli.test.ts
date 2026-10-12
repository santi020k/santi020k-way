import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { z } from 'zod'

import { getStandard, readCatalog } from '../dist/catalog.js'

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url))
const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
const parseJson = (text: string): unknown => JSON.parse(text)

await test('CLI help, version, list, search, and read expose the bundled catalog', () => {
  for (const args of [[], ['--help']]) {
    const result = run(...args)

    assert.equal(result.status, 0)

    assert.match(result.stdout, /Setup and rollback only preview/u)
  }

  assert.equal(run('--version').stdout.trim(), readCatalog().version)

  const entries = z.array(z.object({ id: z.string() })).parse(parseJson(run('list').stdout))

  assert.deepEqual(entries.map(entry => entry.id), readCatalog().entries.map(entry => entry.id))

  const results = z.array(z.object({ id: z.string() })).parse(parseJson(run('search', 'design').stdout))

  assert.equal(results[0]?.id, 'design')

  assert.equal(run('read', 'core').stdout, `${getStandard('core').content}\n`)
})

await test('CLI reports missing arguments, unknown commands, and invalid options', () => {
  const cases: [string[], RegExp][] = [
    [['search'], /Search requires a query/u],
    [['read'], /Read requires a standard ID/u],
    [['list', 'extra'], /takes no arguments/u],
    [['list', ''], /takes no arguments/u],
    [['mcp', ''], /takes no arguments/u],
    [['search', 'two', 'words'], /Quote multi-word/u],
    [['list', '--home', ''], /Setup options only/u],
    [['list', '--apply', ''], /Setup options only/u],
    [['read', 'core', '--backup', ''], /Setup options only/u],
    [['setup', 'codex', '--apply', ''], /non-empty preview hash/u],
    [['setup', 'codex', '--backup', ''], /only applies to rollback/u],
    [['backups', 'codex', '--apply', 'invalid'], /read-only/u],
    [['backups', 'codex', '--backup', ''], /read-only/u],
    [['backups', 'other'], /Unknown command or agent/u],
    [['rollback', 'codex'], /requires --backup/u],
    [['setup', 'other'], /Unknown command or agent/u],
    [['other'], /Unknown command or agent/u],
    [['list', '--unknown'], /Unknown option/u],
    [['read', 'unknown-standard'], /Unknown standard/u]
  ]

  for (const [args, message] of cases) {
    const result = run(...args)

    assert.equal(result.status, 1, args.join(' '))

    assert.match(result.stderr, message)

    assert.equal(result.stdout, '')
  }
})

await test('CLI setup and rollback require reviewed hashes and use only the selected temporary home', async t => {
  const home = await mkdtemp(join(await realpath(tmpdir()), 'way-cli-'))

  t.after(() => rm(home, { recursive: true, force: true }))

  for (const agent of ['codex', 'claude']) {
    const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
    const preview = run('setup', agent, '--home', home)

    assert.equal(preview.status, 0, preview.stderr)

    const { approval } = z.object({ approval: z.string() }).parse(parseJson(preview.stdout))

    await assert.rejects(stat(target), { code: 'ENOENT' })

    assert.equal(run('setup', agent, '--home', home, '--apply', 'invalid').status, 1)

    await assert.rejects(stat(target), { code: 'ENOENT' })

    const installed = run('setup', agent, '--home', home, '--apply', approval)

    assert.equal(installed.status, 0, installed.stderr)

    const { backup } = z.object({ backup: z.string() }).parse(parseJson(installed.stdout))
    const listing = run('backups', agent, '--home', home)

    assert.equal(listing.status, 0, listing.stderr)

    const { backups } = z.object({
      backups: z.array(z.object({ id: z.string(), canRollback: z.boolean() }))
    }).parse(parseJson(listing.stdout))

    assert.deepEqual(backups, [{ id: backup, canRollback: true }])

    assert.ok(!listing.stdout.includes('santi020k-way:start'))

    assert.match(await readFile(target, 'utf8'), /santi020k-way:start/u)

    const rollback = run('rollback', agent, '--home', home, '--backup', backup)

    assert.equal(rollback.status, 0, rollback.stderr)

    const undo = z.object({ approval: z.string() }).parse(parseJson(rollback.stdout))
    const restored = run('rollback', agent, '--home', home, '--backup', backup, '--apply', undo.approval)

    assert.equal(restored.status, 0, restored.stderr)

    await assert.rejects(stat(target), { code: 'ENOENT' })
  }
})

await test('rollback errors never expose malformed private receipt content', async t => {
  const home = await mkdtemp(join(await realpath(tmpdir()), 'way-cli-private-'))

  t.after(() => rm(home, { recursive: true, force: true }))

  const preview = run('setup', 'codex', '--home', home)
  const { approval } = z.object({ approval: z.string() }).parse(parseJson(preview.stdout))
  const installed = run('setup', 'codex', '--home', home, '--apply', approval)
  const { backup } = z.object({ backup: z.string() }).parse(parseJson(installed.stdout))
  const receiptPath = join(home, 'way', 'backups', `${backup}.json`)
  const originalReceipt = z.record(z.string(), z.unknown()).parse(parseJson(await readFile(receiptPath, 'utf8')))
  const originalTarget = await readFile(join(home, 'AGENTS.md'), 'utf8')
  const privateText = 'PRIVATE'

  for (const malformed of [
    privateText,
    `{"before":"${privateText}"`,
    JSON.stringify({ ...originalReceipt, agent: privateText }),
    JSON.stringify({ ...originalReceipt, before: [privateText] })
  ]) {
    await writeFile(receiptPath, malformed)

    for (const extra of [[], ['--apply', approval]]) {
      const result = run('rollback', 'codex', '--home', home, '--backup', backup, ...extra)

      assert.equal(result.status, 1)

      assert.equal(result.stdout, '')

      assert.ok(!result.stderr.includes(privateText), 'Private receipt text appeared in stderr')

      assert.match(result.stderr, /invalid.*private receipt/u)

      assert.equal(await readFile(join(home, 'AGENTS.md'), 'utf8'), originalTarget)

      assert.equal(await readFile(receiptPath, 'utf8'), malformed)
    }
  }
})
