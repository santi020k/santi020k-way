import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { getStandard, readCatalog, searchStandards } from './catalog.js'
import { applyRollback, applySetup, listBackups, planRollback, planSetup } from './setup.js'

const print = (value: unknown): void => {
  console.log(JSON.stringify(value, null, 2))
}

const main = async (): Promise<void> => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    strict: true,
    options: {
      home: { type: 'string' },
      apply: { type: 'string' },
      backup: { type: 'string' },
      help: { type: 'boolean' },
      version: { type: 'boolean' }
    }
  })

  const [command, argument] = positionals

  if (values.version) {
    console.log(readCatalog().version)

    return
  }

  if (values.help || !command) {
    console.log(
      'The santi020k Way\n\nway list\nway search <query>\nway read <id>\nway mcp\nway setup <codex|claude> [--home <absolute-directory>] [--apply <preview-hash>]\nway backups <codex|claude> [--home <absolute-directory>]\nway rollback <codex|claude> --backup <id> [--home <directory>] [--apply <preview-hash>]\n\nSetup and rollback only preview until --apply is supplied. Runtime settings remain local.'
    )

    return
  }

  if (
    command !== 'setup' &&
    command !== 'rollback' &&
    command !== 'backups' &&
    (values.home !== undefined || values.apply !== undefined || values.backup !== undefined)
  )
    throw new Error('Setup options only apply to setup or rollback.')

  if ((command === 'list' || command === 'mcp') && argument !== undefined)
    throw new Error('This command takes no arguments.')

  if (positionals.length > 2)
    throw new Error('Unexpected arguments. Quote multi-word search queries.')

  if (values.apply === '')
    throw new Error('--apply requires a non-empty preview hash.')

  if (command === 'backups' && (values.apply !== undefined || values.backup !== undefined))
    throw new Error('Backups is read-only and accepts only --home.')

  if (command === 'mcp') {
    const { runMcp } = await import('./mcp.js')

    runMcp()

    return
  }

  if (command === 'list') {
    print(
      readCatalog().entries.map(({ id, title, summary }) => ({
        id,
        title,
        summary
      }))
    )

    return
  }

  if (command === 'search') {
    if (!argument) throw new Error('Search requires a query. Run way search <query>.')

    print(searchStandards(argument))

    return
  }

  if (command === 'read') {
    if (!argument) throw new Error('Read requires a standard ID. Run way read <id>.')

    console.log(getStandard(argument).content)

    return
  }

  if (
    (command !== 'setup' && command !== 'rollback' && command !== 'backups') ||
    (argument !== 'codex' && argument !== 'claude')
  )
    throw new Error('Unknown command or agent. Run way --help.')

  const home =
    values.home ??
    (argument === 'codex' ?
      process.env.CODEX_HOME :
      process.env.CLAUDE_CONFIG_DIR) ??
      join(homedir(), argument === 'codex' ? '.codex' : '.claude')

  if (command === 'backups') {
    print({
      agent: argument,
      backups: await listBackups(argument, home),
      note: 'Use an ID with way rollback to review a fresh approval hash. Availability is a snapshot; later edits can block rollback.'
    })

    return
  }

  if (command === 'setup') {
    if (values.backup !== undefined) throw new Error('--backup only applies to rollback.')

    if (values.apply) print(await applySetup(argument, home, values.apply))
    else {
      const plan = await planSetup(argument, home)

      print({
        target: plan.target,
        changed: plan.changed,
        existingBytes: Buffer.byteLength(plan.before ?? ''),
        proposedBytes: Buffer.byteLength(plan.after ?? ''),
        approval: plan.approval,
        managedInstructions: getStandard('core').content,
        references: Object.keys(plan.references),
        note: 'Existing text outside the managed block is preserved. Repeat with --apply and this exact approval hash.'
      })
    }

    return
  }

  if (!values.backup) throw new Error('Rollback requires --backup <id>.')

  if (values.apply) {
    await applyRollback(argument, home, values.backup, values.apply)

    print({ restored: true })

    return
  }

  const plan = await planRollback(argument, home, values.backup)

  print({
    target: plan.target,
    backup: values.backup,
    approval: plan.approval,
    restoreBytes: Buffer.byteLength(plan.after ?? ''),
    removesCreatedFile: plan.after === null
  })
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ?
      error.message :
      'Way failed. Review the command and try again.'
  )

  process.exitCode = 1
})
