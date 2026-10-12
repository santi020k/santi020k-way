import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const root = new URL('../', import.meta.url)

const pkg = JSON.parse(
  await readFile(new URL('packages/way/package.json', root), 'utf8')
)

const catalog = JSON.parse(
  await readFile(new URL('packages/way/dist/data/catalog.json', root), 'utf8')
)

const output = new URL('packages/plugin/dist/', root)

const json = async (url, value) => {
  await mkdir(new URL('./', url), { recursive: true })

  await writeFile(url, `${JSON.stringify(value, null, 2)}\n`)
}

await rm(output, { recursive: true, force: true })

for (const host of ['codex', 'claude']) {
  const marketplace = new URL(`${host}/`, output)
  const plugin = new URL('santi020k-way/', marketplace)

  await mkdir(new URL('runtime/data/', plugin), { recursive: true })

  const metadata = {
    name: 'santi020k-way',
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    homepage: pkg.homepage,
    license: 'MIT'
  }

  await json(new URL('plugin.json', plugin), {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    ...metadata
  })

  await json(new URL('mcp.json', plugin), {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: {
      'santi020k-way': {
        type: 'stdio',
        command: 'node',
        args: ['./runtime/cli.mjs', 'mcp'],
        cwd: './'
      }
    }
  })

  const launch =
    host === 'claude' ?
      {
        command: 'node',
        args: ['${CLAUDE_PLUGIN_ROOT}/runtime/cli.mjs', 'mcp']
      } :
      { command: 'node', args: ['runtime/cli.mjs', 'mcp'], cwd: './' }

  await json(new URL('.mcp.json', plugin), {
    mcpServers: { 'santi020k-way': launch }
  })

  await json(
    new URL(
      host === 'claude' ?
        '.claude-plugin/plugin.json' :
        '.codex-plugin/plugin.json', plugin
    ), {
      ...metadata,
      skills: './skills/',
      mcpServers: './.mcp.json',
      ...(host === 'codex' ?
        { interface: {
          displayName: 'The santi020k Way',
          shortDescription: 'Shared engineering standards',
          longDescription: pkg.description,
          developerName: 'Santiago Molina',
          category: 'Developer Tools',
          capabilities: ['Read engineering standards', 'Apply reusable workflows'],
          websiteURL: pkg.homepage
        } } :
        {})
    }
  )

  if (host === 'claude')
    await json(new URL('.claude-plugin/marketplace.json', marketplace), {
      name: 'santi020k-way',
      owner: pkg.author,
      metadata: { description: pkg.description },
      plugins: [
        {
          name: 'santi020k-way',
          source: './santi020k-way',
          description: pkg.description
        }
      ]
    })
  else
    await json(new URL('.agents/plugins/marketplace.json', marketplace), {
      name: 'santi020k-way',
      interface: { displayName: 'The santi020k Way' },
      plugins: [
        {
          name: 'santi020k-way',
          source: { source: 'local', path: './santi020k-way' },
          policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
          category: 'Developer Tools'
        }
      ]
    })

  for (const skill of await readdir(new URL('skills/', root))) {
    const folder = new URL(`skills/${skill}/`, plugin)

    await mkdir(new URL('references/', folder), { recursive: true })

    await cp(
      new URL(`skills/${skill}/SKILL.md`, root), new URL('SKILL.md', folder)
    )

    for (const entry of catalog.entries)
      await writeFile(
        new URL(`references/${entry.id}.md`, folder), entry.content
      )
  }

  await cp(
    new URL('packages/way/dist/data/catalog.json', root), new URL('runtime/data/catalog.json', plugin)
  )

  await cp(new URL('LICENSE', root), new URL('LICENSE', plugin))

  await build({
    entryPoints: [fileURLToPath(new URL('packages/way/src/cli.ts', root))],
    outfile: fileURLToPath(new URL('runtime/cli.mjs', plugin)),
    bundle: true,
    platform: 'node',
    target: 'node22.22.3',
    format: 'esm',
    banner: {
      js: 'import { createRequire as wayCreateRequire } from \'node:module\'; const require = wayCreateRequire(import.meta.url);'
    }
  })
}
