# Way implementation and maintenance

## Sources and outputs

`standards/catalog.json` indexes accepted standards, architecture decisions, and the original
Codex global guidance. Each record declares its scope, owning source, review date, and tags.
`standards/core.md` is the concise automatic entry point; `standards/reference/global-original.md`
retains the full source policy. Edit the closest canonical source, then rebuild. A reference's
review date describes the guidance, not the current version of a referenced library.

`packages/way` validates the generated catalog, exposes typed queries, runs the read-only stdio
MCP server, and manages local instructions. `scripts/build-catalog.mjs` creates its JSON artifact
and an internal generated module so both Node and Astro bundle the same source safely.

`skills/way-build`, `skills/way-review`, and `skills/way-release` hold task workflows. The plugin
builder materializes their linked references from the catalog; generated copies are never edited
by hand. `packages/plugin/dist/{codex,claude}` contains complete local marketplaces with portable
manifests, host adapters, skills, and bundled MCP runtimes. The Claude adapter expands
`CLAUDE_PLUGIN_ROOT`; Codex resolves its working directory from the installed plugin.

`apps/website` renders the same catalog with Astro, Lumen, and Theme. It includes search, source
provenance, architecture decisions, installation examples, light/dark themes and canonical
metadata for `https://way.santi020k.com`. No catalog service, database, tracking or credentials are
needed to run it. Documentation templates are served as downloads rather than broken repository
relative links.
Source and download directories are regenerated from scratch so retired catalog entries and
templates are removed on incremental builds; other public assets remain intact.

The shared header and footer own site navigation through `apps/website/src/lib/navigation.ts`.
The compact header stays available while reading; mobile navigation uses Lumen's native dialog
and focus handling, with ordinary links retained before enhancement or when JavaScript is off.
The site adds background scroll locking and closes the mobile dialog when crossing into the
desktop layout. Footer groups expose the main routes, design and library guides, and the owned
Lumen and Theme sites. Keep 44px link targets, visible current-route cues, and reduced motion.

## Global configuration ownership

`way setup` previews a small managed instruction section and hashed local references. `--apply`
requires the matching preview hash. Changed instructions receive a private backup receipt;
rollback is conditional on the current file still matching the installed version. An edited
managed section is rejected, while personal text outside the section survives updates. Existing
references are checked for modification, including during a no-op update. Symlink paths are
refused and writes are serialized by a local lock. If a process is killed, inspect the directory
and remove its stale `.way-setup.lock` only after confirming no installer remains running.
Instruction replacement preserves the original file permissions even under a restrictive process
umask; backup receipts and new references remain private.

`way backups <agent>` discovers receipt IDs and creation times without returning saved instruction
text. It validates receipts, rejects symlinks and unsupported file sizes, filters by agent, and
reports whether the current target still matches each recorded installation. Listing never writes
or takes an installer lock. Its availability flag is a snapshot; rollback still requires a fresh
preview and rechecks the target under the existing write lock.

First installation preserves existing guidance, including its size. Santiago's captured global
file exceeds the default Codex 32 KiB combined instruction budget. Review and manually retire
superseded personal text after making a backup; the installer never silently removes it.
Runtime settings are deliberately separate. `config/` contains optional MCP-only examples;
merge the relevant section manually, or install the plugin that supplies it. Use only one MCP
registration per host. No real agent home is modified by repository validation.
Both existing and proposed instruction files must fit the supported 1 MiB limit. Setup rejects an
oversized proposal during preview, before creating references or backups, so installed files remain
readable by updates and rollback.

## Tooling decisions

The workspace requires Node >=22.22.3 and pnpm 10.34.3. ESLint Config Basic and Astro presets remain
pinned at 3.0.0. Core, TypeScript, and
Astro lint contracts are selected explicitly, avoiding automatic activation of the deprecated
integrations package. TypeScript 6 is the newest stable version accepted by Astro's checker.
ESLint owns JS/TS/Astro formatting; Prettier checks documents, JSON, YAML and CSS independently.

Lumen owns interactive primitives and their runtime; Theme owns brand tokens and typography.
Montserrat is vendored from the Theme repository with its OFL license because the installed
Theme package does not yet include the font assets. The optional Lumen phone-input chunks are
generated but never requested by these pages. Quality
and Commitprompt remain the existing hook boundary. Astro Doctor's latest release raises the
minimum Node version, so it is not added. Auth, Dep Beacon and OG are cataloged for appropriate
consumers; this static documentation site has no auth or dependency-monitoring service.

## Verification

`pnpm check` runs the executable ESLint command-policy audit, zero-warning lint, type checks,
behavioral tests, builds, artifact checks, and non-code formatting. Astro warnings also fail the
type-check gate. `pnpm verify` adds browser tests and versioned release archives; it is the shared
pre-push and GitHub Actions completion gate. `pnpm test:browser` covers representative routes,
WCAG checks, responsive overflow, search, theme persistence, keyboard tabs, mobile navigation,
focus return, no-JavaScript navigation, and footer links. Generated plugin
MCP servers are exercised from isolated directories without repository dependencies.
Marketplace manifests are checked alongside their plugin listings and source paths. For host
validation, run `claude plugin validate` on the Claude package and marketplace; Codex can install
the generated marketplace into a temporary profile. `pnpm audit:all` remains an optional sibling
repository audit and is independent of Way's completion gate.

## Hook and delivery ownership

The sibling website and Quality projects provide the reference patterns: Quality owns Git hook
launchers, Commitprompt owns commit messages, and package scripts own validation. `quality.yml`
delegates to `pre-commit` and `pre-push` rather than duplicating their commands. Pre-commit checks
the working tree without automatic fixes, so partially staged changes are never rewritten.
Pre-push checks the complete repository, browser behavior, and portable release packages.
`prepare` attempts installation with an existing compatible Quality CLI; `hooks:install` requires
it explicitly. Neither command downloads executables or overwrites another hook manager.
Installer tests use temporary physical directories and fake tools, never live agent homes.

The reusable Check workflow is the single CI validation definition, following GitHub's
[reusable workflow contract](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).
Pull requests call it directly; main pushes enter Deploy website, which requires it before the
production job. Release publication calls it too. This avoids duplicate main-push checks while
keeping deployment credentials out of validation jobs. Deployment and release rebuild their own
checkout after validation; no untrusted PR artifacts are promoted into production. Production
deployments are serialized, and the public smoke check verifies the deployed commit. Releases
remain an explicit workflow dispatch because package publication has a separate approval boundary.
