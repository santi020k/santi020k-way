<p align="center">
  <a href="README.md">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/hero-dark.svg">
      <img src="docs/assets/readme/hero-light.svg" alt="The santi020k Way — Clear repositories. Dependable delivery." width="1200" height="360">
    </picture>
  </a>
</p>

<h1 align="center">The santi020k Way</h1>

<p align="center">Practical standards for clear repositories and dependable delivery.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-13967e?style=flat-square" alt="License: MIT"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/guides-Engineering-6319be?style=flat-square" alt="Guides: Engineering"></a>
</p>

Reusable engineering conventions learned across the `santi020k` projects.

[Repository presentation](docs/repository-presentation-standard.md) ·
[Release engineering](docs/release-standard.md) ·
[Code quality](docs/quality-standard.md) ·
[Pull requests](docs/pull-request-standard.md) ·
[Audit guide](docs/repository-audit.md)

The shared practices cover repository presentation, release engineering, semantic pull request
titles, and zero-debt code quality: useful READMEs, explicit package and license metadata,
reviewable version changes, reproducible artifacts, safe retries, immutable tags, explicit ESLint
warning budgets, and clean TypeScript handoffs.

**Explore:** [Release resources](#release-resources) · [Audit sibling repositories](#audit-sibling-repositories) · [Scope](#scope)

## Release resources

- [Release standard](docs/release-standard.md)
- [Repository presentation standard](docs/repository-presentation-standard.md)
- [Professional library README template](templates/README-library.md)
- [Professional product README template](templates/README-product.md)
- [Semantic pull request titles](docs/pull-request-standard.md)
- [Repository audit](docs/repository-audit.md)
- [Quality without a mute button](docs/quality-standard.md)
- [Changesets workflow template](templates/changesets-release.yml)
- [PR title workflow template](templates/pr-title.yml)
- [Tagged native release checklist](templates/tagged-native-release.md)
- [Agent quality policy](templates/agent-quality-policy.md)

## Audit sibling repositories

Run the audit from this repository while it remains beside the other projects:

```bash
pnpm audit:releases
pnpm audit:presentation
pnpm audit:quality
pnpm audit:pull-requests
```

The commands print Markdown inventories and report missing presentation, release, or quality
safeguards across the sibling projects.

## Scope

This repository records shared defaults, not rigid rules. A package release, a notarized macOS
application, a TestFlight build, and a Cloudflare deployment have different mechanics. They should
share safety properties without pretending to be the same operation.

## Find your next step

| Resource | Use it for |
| --- | --- |
| [Repository audit](docs/repository-audit.md) | Review sibling repositories against the shared standards. |
| [Library README template](templates/README-library.md) | A reusable starting point for package documentation. |
| [Product README template](templates/README-product.md) | A reusable starting point for application documentation. |

## License

MIT. See [LICENSE](LICENSE).
