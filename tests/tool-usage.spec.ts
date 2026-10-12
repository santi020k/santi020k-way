import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('tool names and aliases surface the usage guide in website search', async ({ page }) => {
  await page.goto('/standards/')

  const search = page.getByRole('searchbox')
  const guide = page.locator('[data-search][href="/standards/packages/"]')

  for (const query of [
    'Lumen',
    'Theme',
    'ESLint Config Basic',
    'Quality',
    'Astro Doctor',
    'astro-doctor',
    'Commitprompt',
    'Dep Beacon',
    'dep-beacon',
    'OG',
    'Open Graph',
    'santi-og',
    'Auth'
  ]) {
    await search.fill(query)

    await expect(guide, query).toBeVisible()
  }

  await guide.focus()

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/standards\/packages\/$/u)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Preferred tools and package boundaries')
})

test('tool guides have usable section links and accessible responsive content', async ({ page }, testInfo) => {
  await page.goto('/standards/packages/')

  for (const [name, id] of [
    ['Lumen', 'lumen'],
    ['Theme', 'theme'],
    ['ESLint Config Basic', 'eslint-config-basic'],
    ['Quality', 'quality'],
    ['Astro Doctor', 'astro-doctor'],
    ['Commitprompt', 'commitprompt'],
    ['Dep Beacon', 'dep-beacon'],
    ['OG', 'og'],
    ['Auth', 'auth']
  ] as const) {
    const link = page.getByRole('link', { name, exact: true })

    await expect(link).toHaveAttribute('href', `#${id}`)

    await link.focus()

    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(new RegExp(`#${id}$`, 'u'))

    await expect(page.getByRole('heading', { name, exact: true })).toHaveAttribute('id', id)

    await expect(page.getByRole('heading', { name, exact: true })).toBeInViewport()
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

  await page.goto('/standards/packages/')

  await page.screenshot({ path: testInfo.outputPath('tool-guide.png') })

  await page.goto('/standards/packages/#og')

  await page.screenshot({ path: testInfo.outputPath('og-guide.png') })
})
