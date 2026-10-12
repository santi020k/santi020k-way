import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import {
  lstat,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile
} from 'node:fs/promises'
import { dirname, isAbsolute, join, parse, resolve, sep } from 'node:path'

import { z } from 'zod'

import { getStandard, readCatalog } from './catalog.js'

export type Agent = 'codex' | 'claude'

const start = '<!-- santi020k-way:start -->'
const end = '<!-- santi020k-way:end -->'
const digest = (value: string) => createHash('sha256').update(value).digest('hex')

const receiptSchema = z.object({
  id: z.uuid(),
  agent: z.enum(['codex', 'claude']),
  before: z.string().nullable(),
  afterHash: z.string(),
  createdAt: z.string(),
  mode: z.number().int()
})

export interface Plan {
  agent: Agent
  home: string
  target: string
  before: string | null
  after: string | null
  approval: string
  changed: boolean
  references: Record<string, string>
  mode: number
}

const missing = (error: unknown): boolean => error instanceof Error && 'code' in error && error.code === 'ENOENT'

const ensureSafePath = async (path: string): Promise<void> => {
  const absolute = resolve(path)
  const root = parse(absolute).root
  let current = root

  for (const part of absolute.slice(root.length).split(sep).filter(Boolean)) {
    current = join(current, part)

    try {
      const stat = await lstat(current)

      if (stat.isSymbolicLink())
        throw new Error(
          'Refusing a symlink in the setup path. Choose a physical directory.'
        )
    } catch (error) {
      if (!missing(error)) throw error
    }
  }
}

const readTarget = async (
  path: string
): Promise<{ content: string | null, mode: number }> => {
  await ensureSafePath(path)

  try {
    const stat = await lstat(path)

    if (!stat.isFile())
      throw new Error('The instruction target must be a regular file.')

    if (stat.size > 1_048_576)
      throw new Error(
        'The existing instructions exceed the supported 1 MiB size.'
      )

    return { content: await readFile(path, 'utf8'), mode: stat.mode & 0o777 }
  } catch (error) {
    if (missing(error)) return { content: null, mode: 0o600 }

    throw error
  }
}

const managedContent = (text: string, block: string): string => {
  const starts = text.split(start).length - 1
  const ends = text.split(end).length - 1

  if (starts === 0 && ends === 0)
    return `${text}${text && !text.endsWith('\n') ? '\n' : ''}${text ? '\n' : ''}${block}\n`

  if (starts !== 1 || ends !== 1 || text.indexOf(start) >= text.indexOf(end))
    throw new Error(
      'Malformed or duplicate Way markers; review the existing file first.'
    )

  const old = text.slice(text.indexOf(start) + start.length, text.indexOf(end))

  const match = /^\n<!-- content-sha256: ([a-f0-9]{64}) -->\n([\s\S]*)$/u.exec(
    old
  )

  if (!match?.[1] || match[2] === undefined || digest(match[2]) !== match[1])
    throw new Error(
      'The managed instructions were edited. Move personal additions outside the Way block before updating.'
    )

  return (
    text.slice(0, text.indexOf(start)) +
    block +
    text.slice(text.indexOf(end) + end.length)
  )
}

const makePlan = (
  agent: Agent,
  home: string,
  before: string | null,
  after: string | null,
  references: Record<string, string>,
  mode: number
): Plan => {
  const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')

  return {
    agent,
    home,
    target,
    before,
    after,
    references,
    mode,
    changed: before !== after,
    approval: digest(
      JSON.stringify({ agent, home, before, after, references, mode })
    )
  }
}

export const planSetup = async (
  agent: Agent,
  directory: string
): Promise<Plan> => {
  if (!isAbsolute(directory))
    throw new Error('Agent home must be an absolute path.')

  const home = resolve(directory)

  const current = await readTarget(
    join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
  )

  const catalog = readCatalog()
  const referenceDirectory = join(home, 'way', 'versions', catalog.hash)

  const references = Object.fromEntries(
    catalog.entries.map(entry => [
      join(referenceDirectory, `${entry.id}.md`),
      entry.content
    ])
  )

  const body = `# The santi020k Way\n\n${getStandard('core', catalog).content}\n\n## Local references\n\n${catalog.entries
    .filter(entry => entry.id !== 'core')
    .map(
      entry => `- ${entry.title}: ${join(referenceDirectory, `${entry.id}.md`)}`
    )
    .join('\n')}\n`

  const block = `${start}\n<!-- content-sha256: ${digest(body)} -->\n${body}${end}`

  return makePlan(
    agent, home, current.content, managedContent(current.content ?? '', block), references, current.mode
  )
}

const atomicWrite = async (
  path: string,
  text: string,
  mode: number
): Promise<void> => {
  await ensureSafePath(path)

  const temp = join(dirname(path), `.way-${randomUUID()}.tmp`)

  try {
    await writeFile(temp, text, { flag: 'wx', mode })

    await ensureSafePath(path)

    await rename(temp, path)
  } finally {
    await unlink(temp).catch((error: unknown) => {
      if (!missing(error)) throw error
    })
  }
}

const withLock = async <T>(
  home: string,
  action: () => Promise<T>
): Promise<T> => {
  if (!isAbsolute(home)) throw new Error('Agent home must be an absolute path.')

  await ensureSafePath(home)

  await mkdir(home, { recursive: true, mode: 0o700 })

  const lockPath = join(home, '.way-setup.lock')

  const lock = await open(
    lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600
  )

  try {
    return await action()
  } finally {
    await lock.close()

    await unlink(lockPath)
  }
}

export const applySetup = async (
  agent: Agent,
  home: string,
  approval: string
): Promise<{ changed: boolean, backup?: string }> => withLock(home, async () => {
  const plan = await planSetup(agent, home)

  if (approval !== plan.approval)
    throw new Error(
      'The preview changed. Run setup again and review the new approval hash.'
    )

  for (const [path, content] of Object.entries(plan.references)) {
    await ensureSafePath(path)

    await mkdir(dirname(path), { recursive: true, mode: 0o700 })

    try {
      await writeFile(path, content, { flag: 'wx', mode: 0o600 })
    } catch (error) {
      if (!(
        error instanceof Error &&
        'code' in error &&
        error.code === 'EEXIST'
      ))
        throw error

      if ((await readFile(path, 'utf8')) !== content)
        throw new Error(
          'An immutable reference was modified. Restore it before updating.', { cause: error }
        )
    }
  }

  if (!plan.changed) return { changed: false }

  const id = randomUUID()
  const backups = join(plan.home, 'way', 'backups')

  await ensureSafePath(backups)

  await mkdir(backups, { recursive: true, mode: 0o700 })

  const receipt = {
    id,
    agent,
    before: plan.before,
    afterHash: digest(plan.after ?? ''),
    mode: plan.mode,
    createdAt: new Date().toISOString()
  }

  await writeFile(join(backups, `${id}.json`), JSON.stringify(receipt), {
    flag: 'wx',
    mode: 0o600
  })

  const current = await readTarget(plan.target)

  if (current.content !== plan.before)
    throw new Error(
      'Instructions changed during setup. No target write was performed; review the new preview.'
    )

  await atomicWrite(plan.target, plan.after ?? '', plan.mode)

  return { changed: true, backup: id }
})

export const planRollback = async (
  agent: Agent,
  directory: string,
  id: string
): Promise<Plan> => {
  z.uuid().parse(id)

  if (!isAbsolute(directory))
    throw new Error('Agent home must be an absolute path.')

  const home = resolve(directory)
  const receiptPath = join(home, 'way', 'backups', `${id}.json`)

  await ensureSafePath(receiptPath)

  const input: unknown = JSON.parse(await readFile(receiptPath, 'utf8'))
  const receipt = receiptSchema.parse(input)

  if (receipt.agent !== agent || receipt.id !== id)
    throw new Error('Backup does not match the requested agent.')

  const target = join(home, agent === 'codex' ? 'AGENTS.md' : 'CLAUDE.md')
  const current = await readTarget(target)

  if (current.content === null || digest(current.content) !== receipt.afterHash)
    throw new Error(
      'Instructions changed after installation. Rollback would overwrite later edits; review them first.'
    )

  return makePlan(
    agent, home, current.content, receipt.before, {}, receipt.mode
  )
}

export const applyRollback = async (
  agent: Agent,
  home: string,
  id: string,
  approval: string
): Promise<void> => {
  await withLock(home, async () => {
    const plan = await planRollback(agent, home, id)

    if (plan.approval !== approval)
      throw new Error('The rollback preview changed. Review a new preview.')

    if (plan.after === null) await unlink(plan.target)
    else await atomicWrite(plan.target, plan.after, plan.mode)
  })
}
