# Repository release audit

Audit date: 2026-07-26. This is a historical sibling inventory, not current release evidence.

Way now uses the v0.1.0 Turborepo implementation and its own validation/release workflows;
see [the release plan](release-v0.1.0.md). Sibling audit commands remain available separately.

| Repository            | Release family                      | Gate and destination                                          | Standardization result                                                  |
| --------------------- | ----------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `aaronmgz`            | Deployment-only                     | Reviewed `main` to changed Cloudflare targets                 | Kept project-specific; no package release                               |
| `astro-doctor`        | Changesets                          | Release PR to npm, VS Marketplace, Open VSX, GitHub tags      | Uses optional `CHANGESETS_TOKEN` with built-in-token fallback           |
| `coolstead`           | Tagged native                       | Reviewed tag to signed/notarized DMG, Sparkle, Homebrew       | Kept tag gate and immutable asset checks                                |
| `dep-beacon`          | Changesets                          | Release PR to npm and extension registries                    | Added retry and concurrency; uses existing `GH_TOKEN`                   |
| `difftale`            | Changesets                          | Release PR to npm and extension registries                    | Added optional `CHANGESETS_TOKEN` contract with built-in-token fallback |
| `eslint-config-basic` | Changesets                          | Release PR to npm, GitHub Releases, and published docs        | Restored release PR using existing `PA_TOKEN`                           |
| `homebrew-tap`        | Distribution downstream             | Updated by native application release workflows               | Kept as a destination, not a release orchestrator                       |
| `lumen`               | Changesets                          | Release PR to npm and repository version tag                  | Added optional `CHANGESETS_TOKEN` contract with built-in-token fallback |
| `memudo.ai`           | Deployment-only                     | Reviewed `main` to Cloudflare Workers and Pages               | Kept project-specific; no package release                               |
| `observatory`         | No GitHub release workflow          | Local/private application                                     | Documented; no release mechanism invented                               |
| `postlens`            | Tagged native plus deployment       | Reviewed tag to TestFlight; `main` to website                 | Kept protected environment and preflight                                |
| `santi020k-theme`     | Changesets plus downstream releases | Release PR to npm, VS Marketplace, Open VSX, Chrome, Terminal | Added optional `CHANGESETS_TOKEN` contract with built-in-token fallback |
| `santi020k-way`       | Standards and audit automation      | Pull-request check for sibling release-workflow drift         | Created reusable guidance, templates, inventory, and executable audit   |
| `website`             | Versioned private application       | Release PR to semantic tag and GitHub Release                 | Added optional `CHANGESETS_TOKEN` contract with built-in-token fallback |
| `workspace-organizer` | Tagged native                       | Reviewed tag to signed/notarized app, Sparkle, Homebrew       | Kept tag gate and immutable asset policy                                |

## Shared baseline

Changesets repositories should satisfy:

- reviewable version and changelog pull request;
- non-cancelling release concurrency;
- manual retry;
- the documented project token when configured, otherwise the built-in token;
- project-owned publish command;
- npm provenance where applicable;
- downstream publication gated on successful package publication.

Tagged native repositories should satisfy:

- semantic tag input;
- exact-tag checkout;
- tag-to-version validation;
- repository validation before signing;
- immutable versioned assets;
- safe retry without replacement;
- downstream update only after primary publication.

Deployment-only repositories are intentionally excluded from Changesets.
