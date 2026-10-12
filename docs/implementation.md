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

## Global configuration ownership

`way setup` previews a small managed instruction section and hashed local references. `--apply`
requires the matching preview hash. Changed instructions receive a private backup receipt;
rollback is conditional on the current file still matching the installed version. An edited
managed section is rejected, while personal text outside the section survives updates. Existing
references are checked for modification, including during a no-op update. Symlink paths are
refused and writes are serialized by a local lock. If a process is killed, inspect the directory
and remove its stale `.way-setup.lock` only after confirming no installer remains running.

First installation preserves existing guidance, including its size. Santiago's captured global
file exceeds the default Codex 32 KiB combined instruction budget. Review and manually retire
superseded personal text after making a backup; the installer never silently removes it.
Runtime settings are deliberately separate. `config/` contains optional MCP-only examples;
merge the relevant section manually, or install the plugin that supplies it. Use only one MCP
registration per host. No real agent home is modified by repository validation.

## Tooling decisions

The workspace retains Node >=22.18 and pnpm 10.34.3. ESLint Config Basic and Astro 3.0.0 are the
newest compatible preset versions; later presets require Node >=22.19. Core, TypeScript, and
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

`pnpm check` runs lint, type checks, behavioral tests, builds, and artifact checks.
`pnpm format:check` checks non-code formatting. `pnpm test:browser` covers representative routes,
WCAG checks, responsive overflow, search, theme persistence and keyboard tabs. Generated plugin
MCP servers are exercised from isolated directories without repository dependencies. For host
validation, run `claude plugin validate` on the Claude package and marketplace; Codex can install
the generated marketplace into a temporary profile. `pnpm audit:all` remains an optional sibling
repository audit and is independent of Way's completion gate.
