// Rewrite real Markdown links before rendering, leaving fenced examples untouched.
export const localTemplateLinks =
  () => (tree: unknown): void => {
    const visit = (node: unknown): void => {
      if (typeof node !== 'object' || node === null) return

      if (
        'type' in node &&
        node.type === 'link' &&
        'url' in node &&
        typeof node.url === 'string'
      ) {
        if (node.url.startsWith('../templates/'))
          node.url = node.url.replace('../templates/', '/downloads/')
      }

      if ('children' in node && Array.isArray(node.children))
        node.children.forEach((child: unknown) => {
          visit(child)
        })
    }

    visit(tree)
  }
