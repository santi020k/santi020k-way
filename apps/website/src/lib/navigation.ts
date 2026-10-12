export const navigation = [
  { href: '/', label: 'Overview', description: 'A shared way to build.' },
  { href: '/standards/', label: 'Standards', description: 'Design, code, and working agreements.' },
  { href: '/architecture/', label: 'Architecture', description: 'The decisions behind the system.' },
  { href: '/start/', label: 'Get started', description: 'Bring Way to Codex and Claude Code.' }
]

export const isCurrentRoute = (path: string, href: string): boolean => href === '/' ? path === href : path === href || path.startsWith(href)
