import { readCatalog } from '@santi020k/way/catalog'

export const GET = (): Response => {
  const paths = [
    '/',
    '/start/',
    '/standards/',
    '/architecture/',
    ...readCatalog().entries.map(entry => `/standards/${entry.id}/`)
  ]

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>https://way.santi020k.com${path}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } }
  )
}
