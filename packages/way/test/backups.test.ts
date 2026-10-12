import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, realpath, rm, stat, symlink, truncate, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'

import { z } from 'zod'

import { applySetup, listBackups, planSetup } from '../dist/setup.js'

const fixture = async (t: TestContext) => {
  const home = await mkdtemp(join(await realpath(tmpdir()), 'way-backups-'))

  t.after(() => rm(home, { recursive: true, force: true }))

  return home
}

const parseJson = (text: string): unknown => JSON.parse(text)

await test('backup discovery does not create a missing home or accept relative paths', async t => {
  const parent = await fixture(t)
  const home = join(parent, 'absent')

  assert.deepEqual(await listBackups('codex', home), [])

  await assert.rejects(stat(home), { code: 'ENOENT' })

  await assert.rejects(listBackups('codex', 'relative-home'), /absolute/u)
})

await test('backup discovery filters agents, protects private text, and detects later edits', async t => {
  const home = await fixture(t)
  const target = join(home, 'AGENTS.md')
  const privateText = 'Private personal guidance that must never be listed.\n'

  await writeFile(target, privateText)

  for (const agent of ['codex', 'claude'] as const) {
    const plan = await planSetup(agent, home)
    const installed = await applySetup(agent, home, plan.approval)

    assert.ok(installed.backup)

    const summaries = await listBackups(agent, home)

    assert.equal(summaries.length, 1)

    const summary = summaries[0]

    assert.ok(summary)

    assert.equal(summary.id, installed.backup)

    assert.equal(summary.canRollback, true)

    assert.doesNotThrow(() => z.iso.datetime().parse(summary.createdAt))

    assert.deepEqual(Object.keys(summary).sort(), ['canRollback', 'createdAt', 'id'])

    assert.ok(!JSON.stringify(summaries).includes(privateText.trim()))
  }

  await writeFile(target, 'Later personal edits.\n')

  assert.equal((await listBackups('codex', home))[0]?.canRollback, false)

  assert.equal(await readFile(target, 'utf8'), 'Later personal edits.\n')

  await rm(target)

  assert.equal((await listBackups('codex', home))[0]?.canRollback, false)

  assert.equal((await listBackups('claude', home))[0]?.canRollback, true)

  await assert.rejects(stat(join(home, '.way-setup.lock')), { code: 'ENOENT' })
})

await test('backup discovery sorts newest first with deterministic ties and ignores unrelated files', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)
  const installed = await applySetup('codex', home, plan.approval)

  assert.ok(installed.backup)

  const backups = join(home, 'way', 'backups')
  const path = join(backups, `${installed.backup}.json`)
  const receipt = z.record(z.string(), z.unknown()).parse(parseJson(await readFile(path, 'utf8')))
  const ids = [installed.backup, randomUUID(), randomUUID()]

  for (const [index, id] of ids.entries())
    await writeFile(join(backups, `${id}.json`), JSON.stringify({
      ...receipt,
      id,
      createdAt: index === 0 ? '2026-02-01T00:00:00Z' : '2026-02-01T00:00:00.001Z'
    }))

  await writeFile(join(backups, 'notes.json'), 'not a receipt')

  await writeFile(join(backups, 'README.md'), 'not a receipt')

  assert.deepEqual((await listBackups('codex', home)).map(item => item.id), [
    ...ids.slice(1).sort((left, right) => left.localeCompare(right)),
    installed.backup
  ])
})

await test('invalid and mismatched receipts fail without exposing their private content', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)
  const installed = await applySetup('codex', home, plan.approval)

  assert.ok(installed.backup)

  const path = join(home, 'way', 'backups', `${installed.backup}.json`)
  const original = await readFile(path, 'utf8')
  const receipt = z.record(z.string(), z.unknown()).parse(parseJson(original))

  for (const text of [
    'Private malformed content',
    JSON.stringify({ ...receipt, id: randomUUID() }),
    JSON.stringify({ ...receipt, createdAt: 'invalid' }),
    JSON.stringify({ ...receipt, afterHash: 'invalid' }),
    JSON.stringify({ ...receipt, mode: -1 })
  ]) {
    await writeFile(path, text)

    await assert.rejects(listBackups('codex', home), {
      message: `Backup ${installed.backup} is invalid. Inspect its private receipt before retrying.`
    })

    assert.equal(await readFile(path, 'utf8'), text)
  }

  const invalidUtf8 = Buffer.from(JSON.stringify({ ...receipt, before: 'private' }))
  const privateOffset = invalidUtf8.indexOf('private')

  assert.ok(privateOffset >= 0)

  invalidUtf8[privateOffset] = 0xff

  await writeFile(path, invalidUtf8)

  await assert.rejects(listBackups('codex', home), {
    message: `Backup ${installed.backup} is invalid. Inspect its private receipt before retrying.`
  })

  assert.deepEqual(await readFile(path), invalidUtf8)

  await writeFile(path, original)

  await truncate(path, 7_000_000)

  await assert.rejects(listBackups('codex', home), /regular file within/u)
})

await test('symlinked and non-regular receipts are refused without reading the destination', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)
  const installed = await applySetup('codex', home, plan.approval)

  assert.ok(installed.backup)

  const path = join(home, 'way', 'backups', `${installed.backup}.json`)
  const outside = join(home, 'private.json')

  await writeFile(outside, 'Private unrelated data')

  await rm(path)

  await symlink(outside, path)

  await assert.rejects(listBackups('codex', home), /symlink/u)

  assert.equal(await readFile(outside, 'utf8'), 'Private unrelated data')

  await rm(path)

  await mkdir(path)

  await assert.rejects(listBackups('codex', home), /regular file within/u)
})
