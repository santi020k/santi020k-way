import { cp, mkdir, rm, writeFile } from 'node:fs/promises'

import { readCatalog } from '../packages/way/dist/catalog.js'

const root = new URL('../', import.meta.url)
const downloads = new URL('apps/website/public/downloads/', root)

await rm(downloads, { recursive: true, force: true })

await cp(new URL('templates/', root), downloads, { recursive: true })

const sources = new URL('apps/website/public/sources/', root)

await rm(sources, { recursive: true, force: true })

await mkdir(sources, { recursive: true })

for (const entry of readCatalog().entries) await writeFile(new URL(`${entry.id}.md`, sources), entry.content)
