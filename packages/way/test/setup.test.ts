import assert from 'node:assert/strict'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'

import {
  applyRollback,
  applySetup,
  planRollback,
  planSetup
} from '../dist/setup.js'

const fixture = async (t: TestContext) => {
  const home = await mkdtemp(join(await realpath(tmpdir()), 'way-test-'))

  t.after(() => rm(home, { recursive: true, force: true }))

  return home
}

for (const agent of ['codex', 'claude'] as const) {
  await test(`${agent}: preview, install, no-op update, and rollback preserve personal guidance`, async t => {
    const home = await fixture(t)
    const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
    const original = '# Personal rules\n\nKeep my project conventions.\n'

    await writeFile(target, original, { mode: 0o640 })

    const plan = await planSetup(agent, home)

    assert.equal(await readFile(target, 'utf8'), original)

    assert.equal(plan.changed, true)

    assert.ok(plan.after)

    assert.ok(plan.after.startsWith(original))

    assert.ok(Buffer.byteLength(plan.after) < 12_000)

    const installed = await applySetup(agent, home, plan.approval)

    assert.ok(installed.backup)

    assert.equal(await readFile(target, 'utf8'), plan.after)

    assert.equal((await stat(target)).mode & 0o777, 0o640)

    for (const [path, content] of Object.entries(plan.references))
      assert.equal(await readFile(path, 'utf8'), content)

    const next = await planSetup(agent, home)

    assert.equal(next.changed, false)

    assert.deepEqual(await applySetup(agent, home, next.approval), {
      changed: false
    })

    const undo = await planRollback(agent, home, installed.backup)

    await applyRollback(agent, home, installed.backup, undo.approval)

    assert.equal(await readFile(target, 'utf8'), original)

    assert.equal(
      (await stat(join(home, 'way', 'backups', `${installed.backup}.json`)))
        .mode & 0o777, 0o600
    )
  })
}

await test('a new install can restore the absence of an instruction file', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)

  await assert.rejects(stat(plan.target), { code: 'ENOENT' })

  const result = await applySetup('codex', home, plan.approval)

  assert.ok(result.backup)

  const rollback = await planRollback('codex', home, result.backup)

  await applyRollback('codex', home, result.backup, rollback.approval)

  await assert.rejects(stat(plan.target), { code: 'ENOENT' })
})

await test('changed previews and invalid hashes cannot overwrite newer instructions', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)

  await writeFile(plan.target, 'A newer personal rule.\n')

  await assert.rejects(
    applySetup('codex', home, plan.approval), /preview changed/u
  )

  assert.equal(await readFile(plan.target, 'utf8'), 'A newer personal rule.\n')

  await assert.rejects(applySetup('codex', home, 'invalid'), /preview changed/u)
})

await test('edited managed sections are rejected while edits outside the section survive', async t => {
  const home = await fixture(t)
  const plan = await planSetup('codex', home)
  const installed = await applySetup('codex', home, plan.approval)

  assert.ok(installed.backup)

  assert.ok(plan.after)

  await writeFile(plan.target, `${plan.after}\nMy extra instruction.\n`)

  const next = await planSetup('codex', home)

  assert.ok(next.after)

  assert.ok(next.after.endsWith('My extra instruction.\n'))

  await assert.rejects(
    planRollback('codex', home, installed.backup), /changed after installation/u
  )

  await writeFile(
    plan.target, plan.after.replace(
      'Shared working agreements', 'Edited working agreements'
    )
  )

  await assert.rejects(
    planSetup('codex', home), /managed instructions were edited/u
  )
})

await test('malformed and duplicate markers are rejected', async t => {
  const home = await fixture(t)

  for (const text of [
    '<!-- santi020k-way:start -->',
    '<!-- santi020k-way:end -->',
    '<!-- santi020k-way:start --><!-- santi020k-way:start --><!-- santi020k-way:end -->'
  ]) {
    await writeFile(join(home, 'AGENTS.md'), text)

    await assert.rejects(planSetup('codex', home), /Malformed/u)
  }
})

await test('symlink targets and mismatched backup identities are refused', async t => {
  const home = await fixture(t)
  const outside = join(home, 'other.md')

  await writeFile(outside, 'Do not modify.')

  await symlink(outside, join(home, 'AGENTS.md'))

  await assert.rejects(planSetup('codex', home), /symlink/u)

  assert.equal(await readFile(outside, 'utf8'), 'Do not modify.')

  const plan = await planSetup('claude', home)
  const installed = await applySetup('claude', home, plan.approval)

  assert.ok(installed.backup)

  await assert.rejects(
    planRollback('codex', home, installed.backup), /does not match/u
  )

  await assert.rejects(planRollback('claude', home, '../escape'))
})

await test('no-op updates reject altered immutable references and restore missing ones', async t => {
  const home = await fixture(t)
  const first = await planSetup('codex', home)

  await applySetup('codex', home, first.approval)

  const reference = Object.entries(first.references)[0]

  assert.ok(reference)

  const [path, content] = reference

  await writeFile(path, 'Unexpected local change')

  const next = await planSetup('codex', home)

  await assert.rejects(applySetup('codex', home, next.approval), /immutable reference/u)

  assert.equal(await readFile(first.target, 'utf8'), first.after)

  await rm(path)

  assert.deepEqual(await applySetup('codex', home, next.approval), { changed: false })

  assert.equal(await readFile(path, 'utf8'), content)
})

await test('relative homes and concurrent installer locks are rejected', async t => {
  await assert.rejects(applySetup('codex', 'relative-home', 'invalid'), /absolute/u)

  const home = await fixture(t)
  const plan = await planSetup('codex', home)

  await writeFile(join(home, '.way-setup.lock'), '')

  await assert.rejects(applySetup('codex', home, plan.approval), { code: 'EEXIST' })

  await assert.rejects(stat(plan.target), { code: 'ENOENT' })
})

await test('setup refuses growth beyond the instruction size limit before writing', async t => {
  const home = await fixture(t)
  const target = join(home, 'AGENTS.md')
  const original = 'é'.repeat(524_288)

  await writeFile(target, original)

  await assert.rejects(planSetup('codex', home), /proposed instructions exceed/u)

  await assert.rejects(applySetup('codex', home, 'invalid'), /proposed instructions exceed/u)

  assert.equal(await readFile(target, 'utf8'), original)

  await assert.rejects(stat(join(home, 'way')), { code: 'ENOENT' })

  await assert.rejects(stat(join(home, '.way-setup.lock')), { code: 'ENOENT' })

  await rm(target)

  const empty = await planSetup('codex', home)
  const fitting = 'x'.repeat(1_048_576 - Buffer.byteLength(empty.after ?? '') - 2)

  await writeFile(target, fitting)

  const boundary = await planSetup('codex', home)

  assert.equal(Buffer.byteLength(boundary.after ?? ''), 1_048_576)

  const installed = await applySetup('codex', home, boundary.approval)

  assert.ok(installed.backup)

  assert.equal((await planSetup('codex', home)).changed, false)

  const rollback = await planRollback('codex', home, installed.backup)

  await applyRollback('codex', home, installed.backup, rollback.approval)

  assert.equal(await readFile(target, 'utf8'), fitting)
})

await test('installation and rollback preserve permissions under a restrictive umask', async t => {
  const home = await fixture(t)
  const target = join(home, 'AGENTS.md')
  const original = 'Personal guidance.\n'

  await writeFile(target, original)

  await chmod(target, 0o660)

  const previousMask = process.umask(0o077)

  try {
    const plan = await planSetup('codex', home)
    const installed = await applySetup('codex', home, plan.approval)

    assert.ok(installed.backup)

    assert.equal((await stat(target)).mode & 0o777, 0o660)

    // The backup's original mode also survives rollback after a permission change.
    await chmod(target, 0o600)

    const rollback = await planRollback('codex', home, installed.backup)

    await applyRollback('codex', home, installed.backup, rollback.approval)

    assert.equal((await stat(target)).mode & 0o777, 0o660)

    assert.equal(await readFile(target, 'utf8'), original)

    assert.equal((await stat(join(home, 'way', 'backups', `${installed.backup}.json`))).mode & 0o777, 0o600)
  } finally {
    process.umask(previousMask)
  }
})

for (const agent of ['codex', 'claude'] as const) {
  await test(`${agent}: invalid UTF-8 is refused without changing the original bytes`, async t => {
    const home = await fixture(t)
    const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
    const bytes = Buffer.from([0x23, 0x20, 0xc3, 0x28, 0x0a])

    await writeFile(target, bytes)

    await assert.rejects(planSetup(agent, home), /valid UTF-8/u)

    await assert.rejects(applySetup(agent, home, 'invalid'), /valid UTF-8/u)

    assert.deepEqual(await readFile(target), bytes)

    await assert.rejects(stat(join(home, 'way')), { code: 'ENOENT' })
  })

  await test(`${agent}: a UTF-8 BOM and non-ASCII guidance survive setup and rollback`, async t => {
    const home = await fixture(t)
    const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
    const bytes = Buffer.from('\ufeff# Personal guidance\r\nConserva los acentos: áéíóú. 🦊\r\n')

    await writeFile(target, bytes)

    const plan = await planSetup(agent, home)

    assert.ok(plan.after?.startsWith(bytes.toString('utf8')))

    const installed = await applySetup(agent, home, plan.approval)

    assert.ok(installed.backup)

    const undo = await planRollback(agent, home, installed.backup)

    await applyRollback(agent, home, installed.backup, undo.approval)

    assert.deepEqual(await readFile(target), bytes)
  })
}

await test('rollback rejects malformed receipt fields before restoring instructions', async t => {
  const home = await fixture(t)
  const original = 'Personal instructions.\n'

  await writeFile(join(home, 'AGENTS.md'), original)

  const setup = await planSetup('codex', home)
  const installed = await applySetup('codex', home, setup.approval)

  assert.ok(installed.backup)

  const path = join(home, 'way', 'backups', `${installed.backup}.json`)
  const saved = await readFile(path, 'utf8')
  const receipt: unknown = JSON.parse(saved)

  assert.ok(typeof receipt === 'object' && receipt !== null)

  for (const fields of [
    { before: 'x'.repeat(1_048_577) },
    { before: 'é'.repeat(524_289) },
    { mode: -1 },
    { mode: 0o1000 },
    { mode: 1.5 },
    { afterHash: 'invalid' },
    { createdAt: 'not-a-date' }
  ]) {
    await writeFile(path, JSON.stringify({ ...receipt, ...fields }))

    await assert.rejects(planRollback('codex', home, installed.backup))

    await assert.rejects(applyRollback('codex', home, installed.backup, 'invalid'))

    assert.equal(await readFile(setup.target, 'utf8'), setup.after)
  }

  await writeFile(path, saved)

  const undo = await planRollback('codex', home, installed.backup)

  await applyRollback('codex', home, installed.backup, undo.approval)

  assert.equal(await readFile(setup.target, 'utf8'), original)
})

await test('rollback refuses oversized and non-regular receipts', async t => {
  const home = await fixture(t)
  const setup = await planSetup('codex', home)
  const installed = await applySetup('codex', home, setup.approval)

  assert.ok(installed.backup)

  const path = join(home, 'way', 'backups', `${installed.backup}.json`)

  await writeFile(path, ' '.repeat(1_048_576 * 6 + 4097))

  await assert.rejects(planRollback('codex', home, installed.backup), /regular file within/u)

  await rm(path)

  await mkdir(path)

  await assert.rejects(planRollback('codex', home, installed.backup), /regular file within/u)

  assert.equal(await readFile(setup.target, 'utf8'), setup.after)
})
