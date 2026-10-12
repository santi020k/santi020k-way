#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'dist',
  'fixtures',
  'node_modules',
])

const pathExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  }
  catch {
    return false
  }
}

const collectPackageFiles = async (directory, packageFiles = []) => {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue

    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      await collectPackageFiles(entryPath, packageFiles)
    }
    else if (entry.name === 'package.json') {
      packageFiles.push(entryPath)
    }
  }

  return packageFiles
}

const commandIssues = (command) => {
  if (typeof command !== 'string' || !/(^|\s)eslint(\s|$)/.test(command)) return []

  const issues = []
  if (/(^|\s)--quiet(\s|$)/.test(command)) issues.push('uses --quiet')
  if (!/(^|\s)--max-warnings(?:=|\s+)0(\s|$)/.test(command)) {
    issues.push('missing --max-warnings=0')
  }
  return issues
}

const lintStagedCommands = (lintStaged = {}) =>
  Object.entries(lintStaged).flatMap(([pattern, value]) =>
    (Array.isArray(value) ? value : [value]).map(command => ({
      location: `lint-staged ${pattern}`,
      command,
    })),
  )

export const auditRepository = async (repositoryDirectory) => {
  const root = resolve(repositoryDirectory)
  if (!(await pathExists(root))) throw new Error(`Repository does not exist: ${root}`)

  const packageFiles = await collectPackageFiles(root)
  const findings = []

  for (const packageFile of packageFiles) {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8'))
    const scriptCommands = Object.entries(packageJson.scripts ?? {})
      .filter(([scriptName]) => scriptName.startsWith('lint') || scriptName === 'format:js')
      .map(([scriptName, command]) => ({ location: `script ${scriptName}`, command }))
    const commands = [...scriptCommands, ...lintStagedCommands(packageJson['lint-staged'])]

    for (const { location, command } of commands) {
      for (const issue of commandIssues(command)) {
        findings.push({
          file: relative(root, packageFile) || 'package.json',
          location,
          issue,
          command,
        })
      }
    }
  }

  return findings
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isDirectRun) {
  const repositoryDirectory = resolve(process.argv[2] ?? '.')
  const findings = await auditRepository(repositoryDirectory)

  if (findings.length === 0) {
    console.log('ESLint command audit passed: zero-warning budgets are explicit.')
  }
  else {
    for (const finding of findings) {
      console.error(
        `${finding.file} (${finding.location}): ${finding.issue}\n  ${finding.command}`,
      )
    }
    process.exitCode = 1
  }
}
