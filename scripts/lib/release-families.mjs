/** @param {{ content: string }[]} workflows */
export const classifyReleaseFamilies = workflows => {
  const families = new Set()

  for (const { content } of workflows) {
    if (content.includes('changesets/action@')) families.add('changesets')

    if (/tags:\s*\n\s*-\s*['"]?v/u.test(content)) families.add('tagged')

    if (/\bdeploy\b/iu.test(content)) families.add('deployment')

    if (content.includes('workflow_dispatch') && /publish-release|npm publish|gh release create/u.test(content)) families.add('manual-release')
  }

  if (families.size > 0) return [...families].sort().join(', ')

  return workflows.length > 0 ? 'automation-only' : 'none'
}
