import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('navigation identifies nested routes and supports keyboard dismissal', async ({ page }) => {
  await page.goto('/standards/design/')

  const dialog = page.getByRole('dialog', { name: 'Find your way.', includeHidden: true })
  const opener = page.getByRole('button', { name: 'Open navigation' })

  await expect(dialog).toHaveAttribute('data-ui-bound', 'true')

  if (await opener.isVisible()) {
    await opener.focus()

    await page.keyboard.press('Enter')

    await expect(dialog).toBeVisible()

    await dialog.evaluate(async element => {
      const animations = element.getAnimations()

      await Promise.all(animations.map(animation => animation.finished))
    })

    await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeFocused()

    await expect(dialog.getByRole('link', { name: /^Standards/ })).toHaveAttribute('aria-current', 'page')

    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden')

    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

    for (let index = 0; index < 9; index++) {
      await page.keyboard.press('Tab')

      // Native dialogs allow Tab into browser chrome, but never into the background page.
      const focusIsContained = await dialog.evaluate(element => {
        if (document.hasFocus()) return element.contains(document.activeElement)

        return document.activeElement === document.body
      })

      expect(focusIsContained).toBe(true)
    }

    await page.keyboard.press('Escape')

    await expect(dialog).not.toBeVisible()

    await expect(opener).toBeFocused()

    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden')

    await opener.click()

    await dialog.getByRole('button', { name: 'Close navigation' }).click()

    await expect(opener).toBeFocused()

    await opener.click()

    await dialog.getByRole('link', { name: /^Get started/ }).click()
  } else {
    const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true })

    await expect(navigation.getByRole('link', { name: 'Standards' })).toHaveAttribute('aria-current', 'page')

    await navigation.getByRole('link', { name: 'Get started' }).click()
  }

  await expect(page).toHaveURL('/start/')

  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('mobile navigation fits narrow and short screens and releases focus on desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('/')

  const dialog = page.getByRole('dialog', { name: 'Find your way.', includeHidden: true })
  const opener = page.getByRole('button', { name: 'Open navigation' })

  for (const viewport of [{ width: 320, height: 640 }, { width: 375, height: 667 }, { width: 740, height: 320 }]) {
    await page.setViewportSize(viewport)

    await opener.click()

    await expect(dialog).toBeVisible()

    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

    expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe('none')

    for (const link of await dialog.getByRole('link').all()) {
      const box = await link.boundingBox()

      expect(box?.height).toBeGreaterThanOrEqual(44)
    }

    const appearance = dialog.getByRole('button', { name: 'Change navigation appearance' })
    const theme = await page.locator('html').getAttribute('data-theme')

    await appearance.click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'dark' ? 'light' : 'dark')

    await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeInViewport()

    await page.keyboard.press('Escape')

    await expect(opener).toBeFocused()
  }

  await opener.click()

  await page.setViewportSize({ width: 1440, height: 1000 })

  await expect(dialog).not.toBeVisible()

  await expect(page.locator('header').getByRole('link', { name: 'The santi020k Way home' })).toBeFocused()

  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden')

  await page.setViewportSize({ width: 390, height: 844 })

  await expect(dialog).not.toBeVisible()

  await opener.click()

  await expect(dialog).toBeVisible()

  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })

  for (const width of [390, 375, 320]) {
    await page.setViewportSize({ width, height: 844 })

    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)

    await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeInViewport()
  }

  await dialog.getByRole('button', { name: 'Close navigation' }).click()

  const footer = page.getByRole('contentinfo')

  expect(await footer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('footer destinations resolve and back to top works below a sticky header', async ({ page, request }) => {
  await page.goto('/')

  const footer = page.getByRole('contentinfo')
  const local = await footer.locator('a[href^="/"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter((href): href is string => href !== null))

  for (const href of local) expect((await request.get(href)).status(), href).toBe(200)

  for (const link of await footer.locator('a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute('rel', /noopener/)

    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }

  await footer.scrollIntoViewIfNeeded()

  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0)

  await footer.getByRole('link', { name: 'Back to top' }).click()

  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)

  await page.keyboard.press('Tab')

  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()

  await page.keyboard.press('Enter')

  await expect(page.getByRole('main')).toBeFocused()
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('navigation remains available', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Open navigation' })).not.toBeVisible()

    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Get started' }).click()

    await expect(page).toHaveURL('/start/')

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
})
