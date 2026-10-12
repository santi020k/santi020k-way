import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCatalog } from '../packages/way/dist/catalog.js'
import { exerciseServer } from '../packages/way/test-support/mcp.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const catalog = readCatalog()
const pkg = JSON.parse(await readFile(join(root, 'packages/way/package.json'), 'utf8'))

assert.equal(catalog.version, pkg.version)

for (const entry of catalog.entries) {
  assert.equal(entry.content, await readFile(join(root, entry.source), 'utf8'), `Stale source: ${entry.id}`)

  assert.equal(entry.contentHash, createHash('sha256').update(entry.content).digest('hex'))

  assert.ok(!entry.content.includes('/Users/'), `Nonportable path: ${entry.id}`)
}

const sandbox = await mkdtemp(join(tmpdir(), 'way-artifacts-'))

try {
  for (const host of ['codex', 'claude']) {
    const marketplaceDirectory = join(sandbox, host)
    const plugin = join(sandbox, host, 'santi020k-way')

    await cp(join(root, 'packages/plugin/dist', host), marketplaceDirectory, { recursive: true })

    const marketplace = JSON.parse(await readFile(join(marketplaceDirectory, host === 'claude' ? '.claude-plugin/marketplace.json' : '.agents/plugins/marketplace.json'), 'utf8'))

    assert.equal(marketplace.name, 'santi020k-way')

    assert.equal(marketplace.plugins.length, 1)

    const listing = marketplace.plugins[0]

    assert.equal(listing.name, 'santi020k-way')

    if (host === 'claude') {
      assert.deepEqual(marketplace.owner, pkg.author)

      assert.equal(marketplace.metadata.description, pkg.description)

      assert.equal(listing.source, './santi020k-way')

      assert.equal(listing.description, pkg.description)
    } else {
      assert.equal(marketplace.interface.displayName, 'The santi020k Way')

      assert.deepEqual(listing.source, { source: 'local', path: './santi020k-way' })

      assert.deepEqual(listing.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' })
    }

    const manifest = JSON.parse(await readFile(join(plugin, 'plugin.json'), 'utf8'))

    assert.equal(manifest.version, pkg.version)

    assert.equal(manifest.name, 'santi020k-way')

    const hostManifest = JSON.parse(await readFile(join(plugin, `.${host}-plugin/plugin.json`), 'utf8'))

    assert.equal(hostManifest.skills, './skills/')

    if (host === 'codex') {
      for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category']) {
        assert.equal(typeof hostManifest.interface?.[field], 'string', `Missing Codex interface.${field}`)

        assert.ok(hostManifest.interface[field].trim().length > 0)
      }

      assert.ok(hostManifest.interface.displayName.length <= 30)

      assert.ok(hostManifest.interface.shortDescription.length <= 30)

      assert.ok(Array.isArray(hostManifest.interface.defaultPrompt) && hostManifest.interface.defaultPrompt.length > 0)

      assert.ok(hostManifest.interface.defaultPrompt.every(prompt => typeof prompt === 'string' && prompt.trim().length > 0))

      assert.ok(Array.isArray(hostManifest.interface.capabilities) && hostManifest.interface.capabilities.length > 0)
    }

    for (const skill of await readdir(join(plugin, 'skills'))) {
      const content = await readFile(join(plugin, 'skills', skill, 'SKILL.md'), 'utf8')

      for (const match of content.matchAll(/\]\((references\/[^)]+)\)/gu)) {
        assert.ok(await readFile(join(plugin, 'skills', skill, match[1]), 'utf8'))
      }
    }

    const configuration = JSON.parse(await readFile(join(plugin, '.mcp.json'), 'utf8'))
    const server = configuration.mcpServers['santi020k-way']

    assert.equal(server.command, 'node')

    const executable = server.args[0].replace('${CLAUDE_PLUGIN_ROOT}', plugin)

    await exerciseServer(host === 'codex' ? join(plugin, executable) : executable, plugin)
  }

  const cli = await readFile(join(root, 'packages/way/dist/cli.js'), 'utf8')

  assert.ok(cli.startsWith('#!/usr/bin/env node\n'), 'Published CLI must be executable')

  for (const path of ['README.md', 'LICENSE']) assert.ok(await readFile(join(root, 'packages/way', path), 'utf8'))

  console.log('Catalog provenance, portable skills, executable CLI, and isolated MCP bundles passed.')
} finally {
  await rm(sandbox, { recursive: true, force: true })
}
