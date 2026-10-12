import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4328', trace: 'retain-on-failure' },
  webServer: { command: 'pnpm --filter @santi020k/way-website preview', url: 'http://127.0.0.1:4328', reuseExistingServer: !process.env.CI },
  projects: (['desktop', 'mobile'] as const).flatMap(size => (['dark', 'light'] as const).map(theme => ({
    name: `${size}-${theme}`,
    use: {
      viewport: size === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 },
      colorScheme: theme
    }
  })))
})
