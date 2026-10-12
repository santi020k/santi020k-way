import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://way.santi020k.com',
  trailingSlash: 'always',
  output: 'static',
  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'phone-metadata', test: /libphonenumber.*metadata/u }
            ]
          }
        }
      }
    }
  }
})
