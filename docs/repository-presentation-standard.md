# Repository presentation standard

Repositories should feel related without erasing the differences between a library, CLI, native
application, website, private product, or downstream distribution repository.

## README baseline

A README is the front door to the project, not an inventory of its files. A visitor should be able
to understand what the project does, decide whether it fits their need, try it, and find deeper
documentation without searching the repository.

Every repository has a root `README.md` with:

- one H1 containing the product or package name;
- a one-sentence value proposition and a short plain-language description before the first H2;
- a compact project link row for the website, documentation, packages or downloads, releases,
  support, and contributing surfaces that actually exist;
- the quickest useful install or setup path with a working first example;
- a feature or capability summary written around user outcomes;
- development and validation commands that match `package.json` or the native toolchain;
- a release, deployment, or distribution note appropriate to the project;
- an explicit license or source-availability section;
- links to the product website and relevant package, store, or marketplace pages when they exist.

Public libraries and products should include a restrained visual identity near the top: a project
mark, product screenshot, social preview, or a small badge row. Badges must convey useful current
state and link to their source. Prefer CI, registry version, downloads or marketplace status, and
license badges. Avoid large walls of technology badges; the README should explain the product
before advertising its implementation.

Add a CodeQL badge only when the repository has an active CodeQL workflow. Editor extensions may
show VS Marketplace, Open VSX, Zed, or another store version only after that exact listing is live.
Never use a static `passing` or version badge for dynamic state, and never advertise an intended
publication channel that currently returns an error.

Private repositories do not need decorative badges, public issue links, or installation marketing.
They should still provide a clear product summary, important operating links, repository map,
setup path, validation command, release runbook, security or privacy boundary, and license status.

## Professional information architecture

Use the smallest structure that answers the reader's questions. A substantial public project
usually follows this order:

1. **Identity:** logo or screenshot, name, value proposition, project links, and useful badges.
2. **Orientation:** what the project does, who it is for, its maturity, and its important limits.
3. **Adoption:** install, quick start, expected output, and links to complete documentation.
4. **Reference:** key features, packages or applications, compatibility, configuration, and API
   entry points.
5. **Trust:** accessibility, privacy, security, support, release policy, and known limitations when
   those topics matter.
6. **Participation:** local development, validation, contributing, code of conduct, and changesets
   or release expectations.
7. **Ownership:** license or source-availability terms and acknowledgements.

Do not add empty ceremonial sections. A small Homebrew tap can be professional with install,
upgrade, formula ownership, support, and license sections. A design system needs a package matrix,
framework quick starts, compatibility, design resources, and contribution guidance.

## Project links

Place a short navigation row close to the title. Use descriptive labels and omit destinations that
do not exist:

```md
[Website](https://example.com) · [Documentation](https://docs.example.com) ·
[npm](https://www.npmjs.com/package/example) · [Releases](https://github.com/owner/repo/releases) ·
[Issues](https://github.com/owner/repo/issues) · [Contributing](CONTRIBUTING.md)
```

For a monorepo, add a package or application table. Public packages link to both their focused
documentation and their npm or marketplace listing. Internal packages link to their directory and
are clearly labeled private. Do not make readers infer which package they should install.

## Quick starts

The first setup path should be copyable and should produce a meaningful result. Libraries show the
install command and the smallest realistic API example. CLIs show a no-install invocation when one
is supported, sample output, and the persistent install path. Applications show prerequisites,
local setup, the development command, and where the app opens.

Keep contributor bootstrapping separate from user installation. `pnpm install` at the repository
root is not a product quick start unless the intended user is a repository contributor.

## Templates

Use the templates as adaptable starting points rather than mandatory prose:

- [`README-library.md`](../templates/README-library.md) for packages, libraries, CLIs, actions,
  and extensions;
- [`README-product.md`](../templates/README-product.md) for applications, websites, and product
  monorepos.

Delete irrelevant sections, replace every placeholder, and keep all commands and links verifiable.

## Package metadata

Every `package.json` declares `private` explicitly. Applications, examples, documentation sites,
and workspace roots use `"private": true` to prevent accidental publication.

Packages intended for npm include a description, SPDX license, repository (with a workspace
`directory` when applicable), homepage, issue tracker, published file allowlist, and explicit
public access for scoped packages. Provenance is preferred when the release workflow supports it.
Marketplace-only packages may follow their marketplace's manifest instead of npm conventions.

The registry is the source of truth for what is actually published. Local versions describe the
next package contents; they do not prove a release exists.

## GitHub presentation

For hosted repositories, keep the GitHub description, homepage, and focused topics aligned with
the README. The description explains the product rather than its implementation alone. The
homepage should point to product documentation or the live product when one exists.

Social preview images are set in GitHub repository settings and cannot be inferred from an Open
Graph asset alone. Use a 1280×640 project-owned image with readable text and safe margins, then
verify it in Settings → General → Social preview.

## Licenses

License choice is a product decision, not a formatting default.

- Open-source repositories include a recognized root license and use the matching SPDX value in
  every publishable package.
- Private source uses `UNLICENSED` or `SEE LICENSE IN LICENSE`; a source-available product may use
  a project-specific license notice.
- Forks retain upstream notices and licensing. Never replace them with a new license merely for
  consistency.
- Missing or ambiguous licenses are reported for owner review rather than guessed.

Copyright years and holder names must reflect the actual project history and owner.
