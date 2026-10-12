import { cp, mkdir, writeFile } from 'node:fs/promises'

import { readCatalog } from '../packages/way/dist/catalog.js'

const root = new URL('../', import.meta.url)

await cp(new URL('templates/', root), new URL('apps/website/public/downloads/', root), { recursive: true })

const sources = new URL('apps/website/public/sources/', root)

await mkdir(sources, { recursive: true })

for (const entry of readCatalog().entries) await writeFile(new URL(`${entry.id}.md`, sources), entry.content)
