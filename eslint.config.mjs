import { defineConfig } from '@santi020k/eslint-config-basic'

// The Node 22.18-compatible preset still auto-loads deprecated integrations.
// Use its core, TypeScript and Astro contracts; run formatting independently.
export default defineConfig({
  detection: false,
  frameworks: { astro: true },
  typescript: true
})
