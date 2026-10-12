import { chmod, readFile, writeFile } from 'node:fs/promises'

const path = new URL('../packages/way/dist/cli.js', import.meta.url)
const content = await readFile(path, 'utf8')

if (!content.startsWith('#!')) await writeFile(path, `#!/usr/bin/env node\n${content}`)

await chmod(path, 0o755)
