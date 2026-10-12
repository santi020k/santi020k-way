import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

import { verifyReleaseAssets } from './lib/release-assets.mjs'

if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.GITHUB_REF !== 'refs/heads/main'
) {
  throw new Error('Release publication must run in GitHub Actions from main.')
}

const pkg = JSON.parse(await readFile('packages/way/package.json', 'utf8'))

if (!/^\d+\.\d+\.\d+$/u.test(pkg.version))
  throw new Error('Release version must be stable semver.')

const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim()
const commit = run('git', ['rev-parse', 'HEAD'])

if (commit !== process.env.GITHUB_SHA)
  throw new Error('Checkout does not match the workflow commit.')

const tag = `v${pkg.version}`

const refs = run('git', [
  'ls-remote',
  '--tags',
  'origin',
  `refs/tags/${tag}`,
  `refs/tags/${tag}^{}`
])

if (refs) {
  const resolved = run('git', ['rev-parse', `${tag}^{commit}`])

  if (resolved !== commit)
    throw new Error('This version already belongs to a different commit.')
}

const existing = await fetch(
  `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/releases/tags/${tag}`, {
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json'
    }
  }
)

if (existing.ok) {
  if (!refs) throw new Error('Existing release has no matching tag.')

  const release = await existing.json()

  const expected = [
    `santi020k-way-codex-${pkg.version}.tgz`,
    `santi020k-way-claude-${pkg.version}.tgz`,
    `santi020k-way-${pkg.version}.tgz`,
    'SHA256SUMS'
  ]

  if (
    !Array.isArray(release.assets) ||
    expected.some(
      name => !release.assets.some(asset => asset.name === name)
    )
  ) {
    throw new Error(
      'Existing release is incomplete. Inspect it and prepare an authorized recovery; no assets were replaced.'
    )
  }

  const local = new Map()
  const remote = new Map()

  for (const name of expected) {
    const asset = release.assets.find(item => item.name === name)

    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/releases/assets/${asset.id}`, {
        headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/octet-stream' },
        signal: AbortSignal.timeout(30000)
      }
    )

    if (!response.ok) throw new Error(`Cannot download release asset ${name} (HTTP ${response.status}).`)

    remote.set(name, Buffer.from(await response.arrayBuffer()))

    local.set(name, await readFile(`dist/${name}`))
  }

  verifyReleaseAssets(release.assets, local, remote)

  console.log('Matching GitHub release and archive payloads verified; no assets replaced.')
} else if (existing.status !== 404) {
  throw new Error(
    `Cannot verify GitHub release state (HTTP ${existing.status}).`
  )
}

if (process.env.WAY_PUBLISH_NPM === 'true') {
  const response = await fetch(
    `https://registry.npmjs.org/@santi020k%2fway/${pkg.version}`
  )

  if (response.ok) {
    const metadata = await response.json()

    if (metadata.gitHead !== commit)
      throw new Error(
        'Existing npm version has different or missing source provenance.'
      )

    console.log('Matching npm version already exists; leaving it unchanged.')
  } else if (response.status === 404) {
    execFileSync('npm', ['publish', '--provenance', '--access', 'public'], {
      cwd: 'packages/way',
      stdio: 'inherit'
    })
  } else {
    throw new Error(
      `Cannot verify npm release state (HTTP ${response.status}).`
    )
  }
}

if (existing.status === 404) {
  execFileSync(
    'gh', [
      'release',
      'create',
      tag,
      '--target',
      commit,
      '--title',
      `The santi020k Way ${tag}`,
      '--notes-file',
      'packages/way/CHANGELOG.md',
      `dist/santi020k-way-codex-${pkg.version}.tgz`,
      `dist/santi020k-way-claude-${pkg.version}.tgz`,
      `dist/santi020k-way-${pkg.version}.tgz`,
      'dist/SHA256SUMS'
    ], { stdio: 'inherit' }
  )
}

const publishedRefs = run('git', [
  'ls-remote',
  '--tags',
  'origin',
  `refs/tags/${tag}`,
  `refs/tags/${tag}^{}`
])

const tagLines = publishedRefs.split('\n')

const publishedTag =
  tagLines.find(line => line.endsWith('^{}')) ?? tagLines[0]

if (publishedTag?.split('\t')[0] !== commit)
  throw new Error('Post-release tag verification failed.')

if (process.env.WAY_PUBLISH_NPM === 'true') {
  const metadata = await fetch(
    `https://registry.npmjs.org/@santi020k%2fway/${pkg.version}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000)
    }
  )

  if (!metadata.ok || (await metadata.json()).gitHead !== commit) {
    throw new Error(
      'Post-release npm provenance is not yet verifiable. Inspect registry state before retrying.'
    )
  }
}

console.log(`Verified immutable release ${tag} at ${commit}.`)
