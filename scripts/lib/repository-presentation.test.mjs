import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('presentation audit ignores installed dependencies and generated package manifests', async t => {
  const root = await mkdtemp(join(tmpdir(), 'way-presentation-'))

  t.after(() => rm(root, { recursive: true, force: true }))

  const script = join(root, 'way', 'scripts', 'audit-repository-presentation.mjs')
  const repository = join(root, 'example')
  const packageRoot = join(repository, 'packages', 'library')

  await mkdir(join(root, 'way', 'scripts'), { recursive: true })

  await cp(new URL('../audit-repository-presentation.mjs', import.meta.url), script)

  await mkdir(join(repository, '.git'), { recursive: true })

  await mkdir(packageRoot, { recursive: true })

  await writeFile(join(repository, 'README.md'), '# Example\n\n## License\n\nMIT\n')

  await writeFile(join(repository, 'LICENSE'), 'MIT')

  const metadata = {
    name: '@example/library',
    private: false,
    description: 'A source package.',
    license: 'MIT',
    repository: 'https://example.com/repo',
    homepage: 'https://example.com',
    bugs: 'https://example.com/issues',
    files: ['dist'],
    publishConfig: { access: 'public' }
  }

  await writeFile(join(packageRoot, 'package.json'), JSON.stringify(metadata))

  for (const folder of ['node_modules/dependency', 'dist', 'build', '.git', '.next', '.turbo', 'fixtures']) {
    const directory = join(packageRoot, folder)

    await mkdir(directory, { recursive: true })

    // These manifests are neither repository-owned packages nor audit inputs.
    await writeFile(join(directory, 'package.json'), 'not a source manifest')
  }

  const run = () => spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' })
  const clean = run()

  assert.equal(clean.status, 0, clean.stderr)

  assert.match(clean.stdout, /@example\/library.*ready/u)

  assert.equal(clean.stdout.split('@example/library').length - 1, 1)

  await writeFile(join(packageRoot, 'package.json'), JSON.stringify({ ...metadata, homepage: '' }))

  const invalid = run()

  assert.equal(invalid.status, 1)

  assert.match(invalid.stdout, /@example\/library.*missing homepage/u)
})
