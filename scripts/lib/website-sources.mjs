import { cp, mkdir, rm, writeFile } from 'node:fs/promises'

export const buildWebsiteSources = async (root, entries) => {
  const downloads = new URL('apps/website/public/downloads/', root)
  const sources = new URL('apps/website/public/sources/', root)

  // These directories contain generated files only; retired guidance must disappear.
  await rm(downloads, { recursive: true, force: true })

  await rm(sources, { recursive: true, force: true })

  await cp(new URL('templates/', root), downloads, { recursive: true })

  await mkdir(sources, { recursive: true })

  for (const entry of entries)
    await writeFile(new URL(`${entry.id}.md`, sources), entry.content)
}
