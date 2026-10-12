import { z } from 'zod'

import data from './generated/catalog.js'

export const standardSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  kind: z.enum(['standard', 'decision', 'reference']),
  scope: z.string(),
  status: z.enum(['accepted', 'reference']),
  source: z.string(),
  reviewedAt: z.string(),
  tags: z.array(z.string()),
  contentHash: z.string(),
  content: z.string()
})

const catalogSchema = z.object({
  version: z.string(),
  hash: z.string(),
  entries: z.array(standardSchema)
})

export type Standard = z.infer<typeof standardSchema>
export type Catalog = z.infer<typeof catalogSchema>

export const readCatalog = (): Catalog => catalogSchema.parse(data)

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
