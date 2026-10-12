import { execFileSync } from 'node:child_process'

const installHooks = () => {
  // Dependency installation in CI and published archives must not modify Git hooks.
  if (process.env.CI) return

  const automatic = process.argv.includes('--automatic')
  const guidance = 'Install Quality CLI >=1.2.0 (https://github.com/santi020k/quality/releases), then run pnpm hooks:install.'

  try {
    execFileSync('git', ['rev-parse', '--git-dir'], { stdio: 'pipe' })
  } catch (error) {
    if (!automatic) throw error

    return
  }

  let version

  try {
    version = execFileSync('quality', ['--version'], { encoding: 'utf8' }).trim()
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error

    if (!automatic) throw new Error(guidance, { cause: error })

    console.error(guidance)

    return
  }

  const match = /^quality (\d+)\.(\d+)\.(\d+)$/u.exec(version)

  if (!match || (Number(match[1]) < 1 || (Number(match[1]) === 1 && Number(match[2]) < 2))) {
    if (!automatic) throw new Error(`Unsupported Quality CLI version. ${guidance}`)

    console.error(`Unsupported Quality CLI version. ${guidance}`)

    return
  }

  // Quality refuses custom hook managers and unmanaged hooks; never overwrite them.
  execFileSync('quality', ['hooks', 'install'], { stdio: 'inherit' })
}

installHooks()
