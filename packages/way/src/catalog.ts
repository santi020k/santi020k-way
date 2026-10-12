import { z } from 'zod'

import data from './generated/catalog.js'
import type { Standard } from './catalog-schema.js'
import { parseCatalog } from './catalog-schema.js'

export type { Catalog, Standard } from './catalog-schema.js'
export { standardSchema } from './catalog-schema.js'

export const readCatalog = () => parseCatalog(data)

export const getStandard = (id: string, catalog = readCatalog()): Standard => {
  const entry = catalog.entries.find(item => item.id === id)

  if (!entry)
    throw new Error(
      `Unknown standard: ${id}. Search or list the catalog first.`
    )

  return entry
}

export const searchStandards = (
  query: string,
  limit = 8,
  catalog = readCatalog()
) => {
  const terms = z
    .string()
    .trim()
    .min(1)
    .max(200)
    .parse(query)
    .toLowerCase()
    .split(/\s+/u)

  z.number().int().min(1).max(20).parse(limit)

  return catalog.entries
    .map(entry => {
      const title = `${entry.title} ${entry.tags.join(' ')}`.toLowerCase()
      const text = `${entry.summary} ${entry.content}`.toLowerCase()

      const score = terms.reduce((sum, term) => {
        if (title.includes(term)) return sum + 5

        return sum + Number(text.includes(term))
      }, 0)

      return { entry, score }
    })
    .filter(item => item.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.entry.id.localeCompare(right.entry.id)
    )
    .slice(0, limit)
    .map(({ entry }) => ({
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      scope: entry.scope,
      source: entry.source,
      reviewedAt: entry.reviewedAt,
      contentHash: entry.contentHash
    }))
}
