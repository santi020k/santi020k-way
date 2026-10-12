import { access, readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectsDirectory = resolve(projectDirectory, '..')
const templatePath = join(projectDirectory, 'templates/pr-title.yml')
const exceptions = new Map([
  [
    'aaronmgz',
    'local policy reserves GitHub Actions for deployments to conserve private-repository minutes',
  ],
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

const entries = await readdir(projectsDirectory, { withFileTypes: true })
const repositories = []

for (const entry of entries) {
  if (!entry.isDirectory()) continue
  const repository = join(projectsDirectory, entry.name)
  if (await pathExists(join(repository, '.git'))) repositories.push(repository)
}

repositories.sort((left, right) => basename(left).localeCompare(basename(right)))

const expectedWorkflow = await readFile(templatePath, 'utf8')
const conventionalTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'chore',
  'refactor',
  'perf',
  'test',
  'ci',
  'build',
  'revert',
]
let issueCount = 0

console.log('| Repository | PR title workflow |')
console.log('| --- | --- |')

for (const repository of repositories) {
  const repositoryName = basename(repository)
  const exception = exceptions.get(repositoryName)

  if (exception) {
    console.log(`| \`${repositoryName}\` | exempt: ${exception} |`)
    continue
  }

  const workflowPath = join(repository, '.github/workflows/pr-title.yml')
  const workflow =
    (await pathExists(workflowPath))
      ? await readFile(workflowPath, 'utf8')
      : undefined
  const isSemanticEquivalent = workflow
    && (workflow.includes('action-semantic-pull-request@') || workflow.includes('PR_TITLE'))
    && workflow.includes('autorelease: pending')
    && workflow.includes('synchronize')
    && workflow.includes('labeled')
    && workflow.includes('unlabeled')
    && conventionalTypes.every(type => workflow.includes(type))
  const isReady = workflow === expectedWorkflow || isSemanticEquivalent

  issueCount += Number(!isReady)
  console.log(`| \`${repositoryName}\` | ${isReady ? 'ready' : 'missing or out of date'} |`)
}

if (issueCount > 0) {
  console.error(`\nFound ${issueCount} PR title workflow issue(s).`)
  process.exitCode = 1
}
