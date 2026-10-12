import assert from 'node:assert/strict'

import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { readCatalog } from '../packages/way/dist/catalog.js'

for (const route of ['/', '/standards/', '/start/', '/architecture/', '/standards/design/']) {
  test(`${route} is accessible and fits the viewport`, async ({ page }, testInfo) => {
    const errors: string[] = []

    page.on('pageerror', error => errors.push(error.message))

    const response = await page.goto(route)

    assert.ok(response)

    expect(response.status()).toBe(200)

    await expect(page.locator('h1')).toHaveCount(1)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://way.santi020k.com${route}`)

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

    expect(errors).toEqual([])

    if (route === '/') await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true })
  })
}

test('search has results, an empty state, and reset', async ({ page }) => {
  await page.goto('/standards/')

  const search = page.getByRole('searchbox')

  await search.fill('Design and brand')

  await expect(page.locator('[data-search]:visible')).toHaveCount(1)

  await search.fill('does-not-exist-8491')

  await expect(page.locator('[data-search]:visible')).toHaveCount(0)

  await search.fill('')

  await expect(page.locator('[data-search]:visible')).toHaveCount(readCatalog().entries.length)
})

test('theme and keyboard code tabs remain usable', async ({ page }) => {
  await page.goto('/start/')

  const before = await page.locator('html').getAttribute('data-theme')

  await page.getByRole('button', { name: 'Toggle color theme' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', before === 'dark' ? 'light' : 'dark')

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-theme', before === 'dark' ? 'light' : 'dark')

  const tabs = page.getByRole('tablist', { name: 'Agent setup commands' })

  await tabs.getByRole('tab', { name: 'Codex', exact: true }).focus()

  await page.keyboard.press('ArrowRight')

  await expect(tabs.getByRole('tab', { name: 'Claude Code', exact: true })).toBeFocused()

  await page.keyboard.press('Enter')

  await expect(tabs.getByRole('tab', { name: 'Claude Code', exact: true })).toHaveAttribute('aria-selected', 'true')
})

test('all catalog entries and their local links resolve', async ({ page, request }) => {
  await page.goto('/standards/')

  const paths = await page.locator('[data-search]').evaluateAll(entries => entries.map(entry => entry.getAttribute('href')).filter((href): href is string => href !== null))

  for (const path of paths) {
    const response = await page.goto(path)

    assert.ok(response)

    expect(response.status()).toBe(200)

    const local = await page.locator('main a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter((href): href is string => href?.startsWith('/') === true))

    for (const href of local) expect((await request.get(href)).status(), href).toBe(200)
  }
})
