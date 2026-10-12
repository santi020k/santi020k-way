# v0.1.0 release plan

The user selected **0.1.0** as the first working release. The local integration branch is
`release/v0.1.0`; `main` holds the preserved pre-implementation standards baseline. This plan
prepares publication. The user authorized open-source publication and the initial deployment on
2026-10-12. The user separately approved the production credential and reuse of the existing
`github-actions-tooling` identity when the Infisical identity limit prevented a dedicated identity.

## Contents

- `@santi020k/way`: standards catalog, CLI and read-only MCP.
- `santi020k-way`: generated Codex and Claude Code plugin marketplaces.
- Astro website for `way.santi020k.com`, built through Turborepo.
- Versioned global working agreements, configuration examples and safe local setup/rollback.

There are no previous published contracts to migrate. Existing globals are retained verbatim
outside the managed section. No databases or production data are involved.

## Before the first push

Run `pnpm install --frozen-lockfile`, install Chromium with
`pnpm exec playwright install chromium`, and run `pnpm verify` (repository checks, formatting,
browser tests, and release archives). Inspect package contents with `pnpm --filter @santi020k/way pack`.
Obtain a fresh independent review of the complete diff against `main`; resolve findings and
repeat affected checks. Confirm the intended repository URL and visibility before assigning a
Git remote. Push and create a release PR only with explicit authorization. Inspect all latest
human/Codex feedback and required checks before an authorized remote merge.

## GitHub publication

After merging the reviewed release PR into `main`, run the **Release** workflow from that branch.
It rebuilds, validates, packages both marketplaces and the npm package, and creates the immutable
version tag and GitHub Release from the selected main commit. Enable its npm input only after
configuring npm Trusted Publishing for this repository's `release.yml` workflow and `release`
environment. The initial npm package may require an explicitly authorized one-time bootstrap;
never substitute a long-lived token or local publication silently. Verify repository metadata
before publication. Retries must verify existing tags and npm `gitHead`, never replace versions.

For later releases, add a Changeset for `@santi020k/way`, run `pnpm changeset version` on the selected
`release/v<semver>`, and commit the version/changelog/lockfile together. Plugin and website display
versions derive from this package. Follow the same reviewed PR and GitHub workflow.

## Website delivery

The **Deploy website** workflow runs automatically on pushes to `main`, with manual dispatch
available for recovery, and requires the protected `production` environment. Its reusable Check
job must pass the same `pnpm verify` gate used before local pushes. Only then does the production
job rebuild the checked revision and import `CLOUDFLARE_API_TOKEN` from the confirmed
Infisical project using GitHub OIDC, and deploys the static Worker configured in
`apps/website/wrangler.jsonc`. The target custom domain is `way.santi020k.com`.

One-time authorized setup must confirm the Cloudflare account/zone, domain ownership, and
Infisical project/environment/path. Configure these GitHub environment variables:
`CLOUDFLARE_ACCOUNT_ID`, `INFISICAL_IDENTITY_ID`, `INFISICAL_PROJECT_ID`, `INFISICAL_ENVIRONMENT`,
`INFISICAL_SECRET_PATH`, and `INFISICAL_DOMAIN`. Use a least-privileged identity bound to the
repository and protected environment. Store the Cloudflare token in that exact Infisical path.
The existing local `.infisical.json` is not exported or changed by this implementation.

The production target is Cloudflare account `5ca91d76ebcd9f998ab424010e0431c5`, zone
`santi020k.com`, and Worker `santi020k-way`. Infisical project **The santi020k Way**
(`85fb45bd-da04-4edb-a9f2-7c8d88c7f82a`) owns the deployment credential in `prod` at
`/website/deploy`, named `CLOUDFLARE_API_TOKEN`. The existing `github-actions-tooling` identity retains its existing OIDC trust for other consumers.
Its Way project membership has the `no-access` role. A separate Way privilege grants only
`describeSecret` and `readValue` for this key, environment and path, conditioned on secret metadata.
Namespaced OIDC mappings `way_subject`, `way_ref` and `way_workflow` map `sub`, `ref` and
`workflow_ref`. Metadata key `way_github_deployment` must equal their pipe-separated values:

```text
repo:santi020k@17752391/santi020k-way@1416127513:environment:production|refs/heads/main|santi020k/santi020k-way/.github/workflows/deploy-website.yml@refs/heads/main
```

This binds Way access to the immutable repository identity, protected production environment,
main branch and deployment workflow. Missing or different claims do not match the metadata.
No secret values belong in GitHub repository files or variables. Infisical Secrets Action v1.0.18 supports
the workflow's `project-id` and single `secret-name` inputs; its reviewed commit is pinned.

Credential bootstrap rollback is to revoke the Way Cloudflare token and remove only the Way
privilege and Way project membership. Never delete the shared identity or change other consumers'
OIDC trust. This stops future deployment access without changing any deployed assets. npm
publication remains an optional separate workflow input; GitHub release archives work independently.

The workflow records a build SHA in the site's `version.json`; post-deploy verification checks
that SHA and the home, standards, setup, and sitemap routes. No production claim is valid until
that workflow and the public smoke checks succeed.

## Recovery

Do not move or delete published tags or npm versions. Fix package/plugin errors with a new patch
release. For local instruction changes, preview and apply `way rollback` using the saved backup
ID; later personal edits intentionally block rollback. For a website regression, revert the
source change through a reviewed PR and run the deployment workflow from the resulting main
commit. Keep the previous successful artifact/deployment available until public smoke checks pass.
