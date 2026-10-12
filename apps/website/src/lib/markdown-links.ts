import { posix } from 'node:path'

import { readCatalog } from '@santi020k/way/catalog'

// Rewrite real Markdown links before rendering, leaving fenced examples untouched.
export const localTemplateLinks =
  (options: { source: string }) => (tree: unknown): void => {
    const routes = new Map(readCatalog().entries.map(entry => [entry.source, `/standards/${entry.id}/`]))

    const visit = (node: unknown): void => {
      if (typeof node !== 'object' || node === null) return

      if (
        'type' in node &&
        node.type === 'link' &&
        'url' in node &&
        typeof node.url === 'string'
      ) {
        let url = node.url
        const source = posix.normalize(posix.join(posix.dirname(options.source), url))
        const route = routes.get(source)

        if (route) url = route

        if (url.startsWith('../templates/'))
          url = url.replace('../templates/', '/downloads/')

        node.url = url
      }

      if ('children' in node && Array.isArray(node.children))
        node.children.forEach((child: unknown) => {
          visit(child)
        })
    }

    visit(tree)
  }
