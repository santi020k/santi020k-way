import { access, readdir, readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { auditRepository } from '../.agents/skills/enforce-quality-gates/scripts/audit-eslint-commands.mjs'

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectsDirectory = resolve(projectDirectory, '..')
const policyMarker = '<!-- santi020k-quality-policy:start -->'

const pathExists = async filePath => {
  try {
    await access(filePath)

    return true
  } catch {
    return false
  }
}

const entries = await readdir(projectsDirectory, { withFileTypes: true })
const repositories = []

for (const entry of entries) {
  if (!entry.isDirectory()) continue

  const repository = join(projectsDirectory, entry.name)

  if (await pathExists(join(repository, '.git'))) repositories.push(repository)
}

repositories.sort((left, right) => basename(left).localeCompare(basename(right)))

let issueCount = 0

console.log('| Repository | AGENTS.md | ESLint commands |')

console.log('| --- | --- | --- |')

for (const repository of repositories) {
  const agentsPath = join(repository, 'AGENTS.md')

  const hasPolicy =
    (await pathExists(agentsPath)) &&
    (await readFile(agentsPath, 'utf8')).includes(policyMarker)

  const eslintFindings = await auditRepository(repository)

  issueCount += Number(!hasPolicy) + eslintFindings.length

  console.log(
    `| \`${basename(repository)}\` | ${hasPolicy ? 'ready' : 'missing policy'} | ${
      eslintFindings.length === 0 ?
        'ready' :
        `${eslintFindings.length} issue(s)`
    } |`
  )

  for (const finding of eslintFindings) {
    console.error(
      `${basename(repository)}/${finding.file} (${finding.location}): ${finding.issue}`
    )
  }
}

if (issueCount > 0) {
  console.error(`\nFound ${issueCount} quality gate issue(s).`)

  process.exitCode = 1
}
