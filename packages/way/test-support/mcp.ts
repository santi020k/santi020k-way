import assert from 'node:assert/strict'

import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

export const exerciseServer = async (path: string, cwd: string) => {
  const client = new Client({ name: 'way-contract-test', version: '1.0.0' })

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path, 'mcp'],
    cwd
  })

  try {
    await client.connect(transport)

    const tools = await client.listTools()

    assert.deepEqual(tools.tools.map(tool => tool.name).sort(), [
      'catalog_info',
      'get_standard',
      'search_standards'
    ])

    assert.ok(
      tools.tools.every(
        tool => tool.annotations?.readOnlyHint && !tool.annotations.destructiveHint
      )
    )

    const search = await client.callTool({
      name: 'search_standards',
      arguments: { query: 'design', limit: 2 }
    })

    assert.ok(
      search.content.some(
        item => item.type === 'text' && item.text.includes('Design and brand')
      )
    )

    const read = await client.callTool({
      name: 'get_standard',
      arguments: { id: 'design' }
    })

    assert.ok(
      read.content.some(
        item => item.type === 'text' && item.text.includes('contentHash')
      )
    )

    const missing = await client.callTool({
      name: 'get_standard',
      arguments: { id: '../../etc/passwd' }
    })

    assert.equal(missing.isError, true)

    const invalid = await client.callTool({
      name: 'search_standards',
      arguments: { query: '', limit: 200 }
    })

    assert.equal(invalid.isError, true)
  } finally {
    await client.close()
  }
}
