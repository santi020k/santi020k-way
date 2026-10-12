import { defineConfig } from '@playwright/test'

const port = Number(process.env.WAY_TEST_PORT ?? '4329')

if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('WAY_TEST_PORT must be an integer between 1024 and 65535.')

const baseURL = `http://127.0.0.1:${port}`
const command = `pnpm --filter @santi020k/way-website exec astro preview --host 127.0.0.1 --port ${port}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: { command, url: baseURL, reuseExistingServer: false },
  projects: (['desktop', 'mobile'] as const).flatMap(size => (['dark', 'light'] as const).map(theme => ({
    name: `${size}-${theme}`,
    use: {
      viewport: size === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 },
      colorScheme: theme
    }
  })))
})
