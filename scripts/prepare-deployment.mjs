import { writeFile } from 'node:fs/promises'

const names = [
  'CLOUDFLARE_ACCOUNT_ID',
  'INFISICAL_IDENTITY_ID',
  'INFISICAL_PROJECT_ID',
  'INFISICAL_ENVIRONMENT',
  'INFISICAL_SECRET_PATH',
  'INFISICAL_DOMAIN'
]

for (const name of names) {
  if (!process.env[name]?.trim())
    throw new Error(
      `Configure ${name} in the protected production environment.`
    )
}

if (
  process.env.GITHUB_REF !== 'refs/heads/main' ||
  !/^[a-f0-9]{40}$/u.test(process.env.GITHUB_SHA ?? '')
) {
  throw new Error(
    'Deployment requires a recorded main revision from GitHub Actions.'
  )
}

await writeFile(
  'apps/website/dist/version.json', `${JSON.stringify({ commit: process.env.GITHUB_SHA })}\n`
)
