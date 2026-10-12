import { createHash } from 'node:crypto'

import { z } from 'zod'

const hash = (text: string): string => createHash('sha256').update(text).digest('hex')
const sha256 = z.string().regex(/^[a-f0-9]{64}$/u)

export const standardMetadataSchema = z.object({
  id: z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  kind: z.enum(['standard', 'decision', 'reference']),
  scope: z.string().trim().min(1),
  status: z.enum(['accepted', 'reference']),
  source: z.string().regex(/^(?:standards|docs)\/[a-zA-Z0-9/_.-]+\.md$/u)
    .refine(value => value.split('/').every(part => part !== '.' && part !== '..' && part !== '')),
  reviewedAt: z.iso.date(),
  tags: z.array(z.string().trim().min(1)).min(1)
})

export const standardSchema = standardMetadataSchema.extend({
  contentHash: sha256,
  content: z.string().min(1)
}).refine(entry => hash(entry.content) === entry.contentHash, 'Standard content hash does not match.')

const checkIdentities = (entries: { id: string }[], context: z.RefinementCtx): void => {
  if (new Set(entries.map(entry => entry.id)).size !== entries.length)
    context.addIssue({ code: 'custom', message: 'Catalog standard IDs must be unique.' })

  if (!entries.some(entry => entry.id === 'core'))
    context.addIssue({ code: 'custom', message: 'Catalog must include the core standard.' })
}

export const catalogMetadataSchema = z.array(standardMetadataSchema).min(1).superRefine(checkIdentities)

const catalogSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u),
  hash: sha256,
  entries: z.array(standardSchema).min(1).superRefine(checkIdentities)
}).refine(catalog => hash(JSON.stringify(catalog.entries)) === catalog.hash, 'Catalog hash does not match.')

export type Standard = z.infer<typeof standardSchema>
export type Catalog = z.infer<typeof catalogSchema>

export const parseCatalog = (input: unknown): Catalog => catalogSchema.parse(input)
