import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { parse } from 'yaml'

const workflow = parse(await readFile(new URL('../../.github/workflows/check.yml', import.meta.url), 'utf8'))
const manifest = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'))

await test('CI preserves the full verification gate with repository checks before browser setup', () => {
  const steps = workflow.jobs.check.steps
  const check = steps.findIndex(step => step.run === 'pnpm check')
  const install = steps.findIndex(step => step.run === 'pnpm exec playwright install --with-deps chromium')
  const browser = steps.findIndex(step => step.run === 'pnpm test:browser && pnpm package:release')

  assert.ok(check >= 0 && check < install && install < browser)

  assert.equal(`${steps[check].run} && ${steps[browser].run}`, manifest.scripts.verify)

  for (const step of steps.slice(check, browser + 1)) {
    assert.equal(step.if, undefined, 'dependent steps must retain the default success condition')

    assert.notEqual(step['continue-on-error'], true)
  }

  assert.equal(steps.at(-1).if, 'always()', 'failure diagnostics must remain available')
})

await test('deployment and publication require the full reusable validation workflow', async () => {
  for (const [file, job] of [['deploy-website.yml', 'deploy'], ['release.yml', 'release']]) {
    const consumer = parse(await readFile(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8'))

    assert.equal(consumer.jobs.validate.uses, './.github/workflows/check.yml')

    assert.equal(consumer.jobs[job].needs, 'validate')

    assert.equal(consumer.jobs[job].if, 'github.ref == \'refs/heads/main\'')
  }
})
