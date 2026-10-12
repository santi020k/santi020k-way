import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('readers can find the working guide from the homepage and catalog', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Read the way of working' }).click()

  await expect(page).toHaveURL(/\/standards\/way-of-working\/$/u)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The santi020k way of working')

  await page.goto('/standards/')

  await page.getByRole('searchbox').fill('onboarding')

  await page.getByRole('link', { name: /The santi020k way of working/u }).click()

  await expect(page).toHaveURL(/\/standards\/way-of-working\/$/u)
})

test('the working guide is readable and its reading map navigates to detailed standards', async ({ page }, testInfo) => {
  await page.goto('/standards/way-of-working/')

  await expect(page.getByRole('heading', { name: 'Make boundaries explicit' })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Know what done means' })).toBeVisible()

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

  await page.screenshot({ path: testInfo.outputPath('working-guide.png'), fullPage: true })

  const quality = page.getByRole('link', { name: 'Quality without a mute button', exact: true })

  await quality.focus()

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/standards\/quality\/$/u)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quality without a mute button')
})
