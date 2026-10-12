import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { exerciseServer } from '../test-support/mcp.ts'

await test(
  'stdio MCP exposes only the bounded read-only catalog', { timeout: 15_000 }, async () => {
    await exerciseServer(
      fileURLToPath(new URL('../dist/cli.js', import.meta.url)), fileURLToPath(new URL('../', import.meta.url))
    )
  }
)
