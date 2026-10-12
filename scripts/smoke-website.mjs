import assert from 'node:assert/strict'

const origin = 'https://way.santi020k.com'

for (const path of ['/', '/standards/', '/start/', '/sitemap.xml']) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000) })

  assert.equal(response.status, 200, `Public route failed: ${path}`)

  const body = await response.text()

  assert.ok(body.includes(path === '/sitemap.xml' ? '<urlset' : 'The santi020k Way'))
}

const response = await fetch(`${origin}/version.json?revision=${process.env.GITHUB_SHA}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })

assert.equal(response.status, 200)

assert.equal((await response.json()).commit, process.env.GITHUB_SHA)

console.log('Public routes and deployed revision verified.')
