import { access, readdir, readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { classifyReleaseFamilies } from './lib/release-families.mjs'

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectsDirectory = resolve(projectDirectory, '..')
const checkMode = process.argv.includes('--check')

const pathExists = async filePath => {
  try {
    await access(filePath)

    return true
  } catch {
    return false
  }
}

const readWorkflowFiles = async repositoryDirectory => {
  const workflowsDirectory = join(repositoryDirectory, '.github', 'workflows')

  if (!(await pathExists(workflowsDirectory))) return []

  const workflowNames = await readdir(workflowsDirectory)

  const workflowPaths = workflowNames
    .filter(
      workflowName => workflowName.endsWith('.yml') || workflowName.endsWith('.yaml')
    )
    .map(workflowName => join(workflowsDirectory, workflowName))

  return Promise.all(
    workflowPaths.map(async workflowPath => ({
      path: workflowPath,
      content: await readFile(workflowPath, 'utf8')
    }))
  )
}

const getDocumentedGitHubToken = async repositoryDirectory => {
  const environmentExamplePath = join(repositoryDirectory, '.env.example')

  if (!(await pathExists(environmentExamplePath))) return undefined

  const environmentExample = await readFile(environmentExamplePath, 'utf8')
  const tokenNames = ['CHANGESETS_TOKEN', 'GH_TOKEN', 'PA_TOKEN']

  return tokenNames.find(tokenName => environmentExample.includes(`${tokenName}=`))
}

const getChangesetsIssues = (workflows, documentedGitHubToken) => {
  const changesetsWorkflows = workflows.filter(workflow => workflow.content.includes('changesets/action@'))

  if (changesetsWorkflows.length === 0) return []

  const expectedToken = documentedGitHubToken ?
    `secrets.${documentedGitHubToken} || github.token` :
    'GITHUB_TOKEN: ${{ github.token }}'

  const combinedChangesetsWorkflows = changesetsWorkflows
    .map(workflow => workflow.content)
    .join('\n')

  const publishingWorkflows = changesetsWorkflows.filter(workflow => workflow.content.includes('publish:'))
  const issues = []

  if (!combinedChangesetsWorkflows.includes('pull-requests: write')) {
    issues.push('release PR permission')
  }

  if (!/^\s*(?:version|version-script):/mu.test(combinedChangesetsWorkflows)) {
    issues.push('version command')
  }

  if (!combinedChangesetsWorkflows.includes(expectedToken)) {
    issues.push('documented automation token')
  }

  for (const publishingWorkflow of publishingWorkflows) {
    if (!publishingWorkflow.content.includes('cancel-in-progress: false')) {
      issues.push('non-cancelling publish concurrency')
    }

    if (
      /\bpush:\s*\n/.test(publishingWorkflow.content) &&
      !publishingWorkflow.content.includes('workflow_dispatch')
    ) {
      issues.push('manual publish retry')
    }
  }

  return [...new Set(issues)]
}

const directoryEntries = await readdir(projectsDirectory, {
  withFileTypes: true
})

const repositoryDirectories = []

for (const directoryEntry of directoryEntries) {
  if (!directoryEntry.isDirectory()) continue

  const repositoryDirectory = join(projectsDirectory, directoryEntry.name)

  if (await pathExists(join(repositoryDirectory, '.git'))) {
    repositoryDirectories.push(repositoryDirectory)
  }
}

repositoryDirectories.sort((first, second) => basename(first).localeCompare(basename(second)))

const auditRows = []
let issueCount = 0

for (const repositoryDirectory of repositoryDirectories) {
  const workflows = await readWorkflowFiles(repositoryDirectory)
  const releaseFamily = classifyReleaseFamilies(workflows)

  const documentedGitHubToken =
    await getDocumentedGitHubToken(repositoryDirectory)

  const issues = getChangesetsIssues(workflows, documentedGitHubToken)

  issueCount += issues.length

  auditRows.push({
    repository: basename(repositoryDirectory),
    releaseFamily,
    issues: issues.length === 0 ? 'none' : issues.join(', ')
  })
}

console.log('| Repository | Release family | Missing safeguards |')

console.log('| --- | --- | --- |')

for (const auditRow of auditRows) {
  console.log(
    `| \`${auditRow.repository}\` | ${auditRow.releaseFamily} | ${auditRow.issues} |`
  )
}

if (checkMode && issueCount > 0) {
  console.error(`\nFound ${issueCount} missing Changesets safeguard(s).`)

  process.exitCode = 1
}
