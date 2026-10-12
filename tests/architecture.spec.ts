import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('architecture explains the flow and provides working next steps', async ({ page, request }, testInfo) => {
  await page.goto('/architecture/')

  await page.getByRole('link', { name: 'Follow the guidance' }).focus()

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/#guidance-flow$/u)

  await expect(page.getByRole('heading', { name: 'One build. Shared context.' })).toBeInViewport()

  for (const heading of ['Standards & decisions', 'A validated catalog', 'Choose your entry point'])
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()

  const main = page.getByRole('main')
  const links = await main.locator('a[href^="/"]').evaluateAll(elements => elements.map(element => element.getAttribute('href')).filter((href): href is string => href !== null))

  expect(links).toHaveLength(3)

  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)

  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

  await page.goto('/architecture/')

  await page.evaluate(() => document.fonts.ready)

  await page.screenshot({ path: testInfo.outputPath('architecture.png'), fullPage: true })

  await main.getByRole('link', { name: 'Set up your agent' }).focus()

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL('/start/')
})

test('architecture reflows on narrow screens and with enlarged text', async ({ page }) => {
  await page.goto('/architecture/')

  for (const fontSize of ['100%', '200%']) {
    await page.evaluate(size => {
      document.documentElement.style.fontSize = size
    }, fontSize)

    for (const width of [320, 700, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })

      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)

      expect(fits, `${width}px at ${fontSize}`).toBe(true)
    }
  }
})
