import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

export const sha256 = content => createHash('sha256').update(content).digest('hex')

// Compare payloads rather than gzip/tar timestamps, which vary between clean builds.
export const archivePayload = archive => {
  const tar = args => execFileSync('tar', args, { input: archive, maxBuffer: 32 * 1024 * 1024 })
  const names = tar(['-tzf', '-']).toString('utf8').trim().split('\n')
  const modes = tar(['-tvzf', '-']).toString('utf8').trim().split('\n').map(line => line.split(/\s+/u)[0])

  if (names.length !== modes.length || new Set(names).size !== names.length)
    throw new Error('Archive has ambiguous entries.')

  return names.map((name, index) => {
    const mode = modes[index]

    if (!mode || !['-', 'd'].includes(mode[0]))
      throw new Error('Release archives must contain only regular files and directories.')

    return [name, mode, mode[0] === 'd' ? '' : sha256(tar(['-xOzf', '-', '--', name]))]
  }).sort(([left], [right]) => left.localeCompare(right))
}

export const verifyReleaseAssets = (assets, local, remote) => {
  const checksums = remote.get('SHA256SUMS')?.toString('utf8')

  if (!checksums) throw new Error('Remote checksum manifest is missing.')

  for (const [name, content] of remote) {
    const asset = assets.find(item => item.name === name)

    if (!asset || asset.size !== content.length)
      throw new Error(`Remote release asset size mismatch: ${name}`)

    if (name === 'SHA256SUMS') continue

    if (!checksums.split('\n').includes(`${sha256(content)}  ${name}`))
      throw new Error(`Remote release checksum mismatch: ${name}`)

    const fresh = local.get(name)

    if (!fresh || JSON.stringify(archivePayload(content)) !== JSON.stringify(archivePayload(fresh)))
      throw new Error(`Remote release payload differs from the checked revision: ${name}`)
  }
}
