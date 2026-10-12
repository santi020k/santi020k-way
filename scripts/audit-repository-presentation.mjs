import { access, readdir, readFile, realpath } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectsDirectory = resolve(projectDirectory, '..')
const checkMode = process.argv.includes('--check')
const excludedRepositories = new Set(['lumen-production-cleanup'])
const licenseReviewExceptions = new Set(['extensions'])
const marketplacePackageNames = new Set(['santi020k-theme'])

const pathExists = async filePath => {
  try {
    await access(filePath)

    return true
  } catch {
    return false
  }
}

const readJson = async filePath => JSON.parse(await readFile(filePath, 'utf8'))

const directoryEntries = await readdir(projectsDirectory, {
  withFileTypes: true
})

const repositories = []
const seenGitDirectories = new Set()

for (const entry of directoryEntries) {
  if (!entry.isDirectory()) continue

  if (excludedRepositories.has(entry.name)) continue

  const repository = join(projectsDirectory, entry.name)
  const gitPath = join(repository, '.git')

  if (!(await pathExists(gitPath))) continue

  const canonicalGitPath = await realpath(gitPath)

  if (seenGitDirectories.has(canonicalGitPath)) continue

  seenGitDirectories.add(canonicalGitPath)

  repositories.push(repository)
}

repositories.sort((left, right) => basename(left).localeCompare(basename(right)))

let issueCount = 0

console.log('| Repository | README | Root package | License |')

console.log('| --- | --- | --- | --- |')

for (const repository of repositories) {
  const issues = []
  const readmePath = join(repository, 'README.md')
  const packagePath = join(repository, 'package.json')
  const licensePaths = ['LICENSE', 'LICENSE.md'].map(file => join(repository, file))
  let readmeStatus

  if (!(await pathExists(readmePath))) {
    readmeStatus = 'missing'

    issues.push('README')
  } else {
    const readme = await readFile(readmePath, 'utf8')
    const readmeIssues = []

    if (
      !/^#\s+\S/m.test(readme) &&
      !/<h1(?:\s[^>]*)?>.*<\/h1>/is.test(readme)
    ) {
      readmeIssues.push('H1')
    }

    if (
      !/^#{2,3}\s+(?:[^\n]*\s)?(?:License|Source availability)\s*$/im.test(
        readme
      )
    ) {
      readmeIssues.push('license section')
    }

    readmeStatus =
      readmeIssues.length === 0 ? 'ready' : `missing ${readmeIssues.join(', ')}`

    issues.push(...readmeIssues.map(issue => `README ${issue}`))
  }

  let packageStatus = 'not applicable'

  if (await pathExists(packagePath)) {
    const manifest = await readJson(packagePath)
    const packageIssues = []

    if (typeof manifest.private !== 'boolean')
      packageIssues.push('explicit private')

    if (!manifest.description) packageIssues.push('description')

    if (
      !manifest.license &&
      !licenseReviewExceptions.has(basename(repository))
    ) {
      packageIssues.push('license')
    }

    packageStatus =
      packageIssues.length === 0 ?
        'ready' :
        `missing ${packageIssues.join(', ')}`

    issues.push(...packageIssues.map(issue => `package ${issue}`))
  }

  const hasLicense = (await Promise.all(licensePaths.map(pathExists))).some(
    Boolean
  )

  const licenseException = licenseReviewExceptions.has(basename(repository))
  let licenseStatus = 'missing or owner decision required'

  if (hasLicense) licenseStatus = 'present'
  else if (licenseException) licenseStatus = 'upstream has no root license'

  if (!hasLicense && !licenseException) issues.push('license file')

  issueCount += issues.length

  console.log(
    `| \`${basename(repository)}\` | ${readmeStatus} | ${packageStatus} | ${licenseStatus} |`
  )
}

const collectPackageManifests = async directory => {
  if (!(await pathExists(directory))) return []

  const manifests = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      manifests.push(...(await collectPackageManifests(entryPath)))
    } else if (entry.isFile() && entry.name === 'package.json') {
      manifests.push(entryPath)
    }
  }

  return manifests
}

console.log('\n| npm package | Metadata |')

console.log('| --- | --- |')

for (const repository of repositories) {
  const packageManifests = await collectPackageManifests(
    join(repository, 'packages')
  )

  for (const manifestPath of packageManifests.sort()) {
    const manifest = await readJson(manifestPath)

    if (!manifest.name || manifest.private === true) continue

    if (marketplacePackageNames.has(manifest.name)) {
      console.log(`| \`${manifest.name}\` | marketplace manifest |`)

      continue
    }

    const missingFields = []

    if (!manifest.description) missingFields.push('description')

    if (!manifest.license) missingFields.push('license')

    if (!manifest.repository) missingFields.push('repository')

    if (!manifest.homepage) missingFields.push('homepage')

    if (!manifest.bugs) missingFields.push('bugs')

    if (!Array.isArray(manifest.files)) missingFields.push('files')

    if (
      manifest.name.startsWith('@') &&
      manifest.publishConfig?.access !== 'public'
    ) {
      missingFields.push('public access')
    }

    issueCount += missingFields.length

    const manifestLocation = relative(projectsDirectory, manifestPath)

    console.log(
      `| \`${manifest.name}\` | ${
        missingFields.length === 0 ?
          `ready (${manifestLocation})` :
          `missing ${missingFields.join(', ')}`
      } |`
    )
  }
}

if (checkMode && issueCount > 0) {
  console.error(`\nFound ${issueCount} repository presentation issue(s).`)

  process.exitCode = 1
}
