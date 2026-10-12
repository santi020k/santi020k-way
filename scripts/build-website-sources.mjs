import { readCatalog } from '../packages/way/dist/catalog.js'

import { buildWebsiteSources } from './lib/website-sources.mjs'

await buildWebsiteSources(new URL('../', import.meta.url), readCatalog().entries)
