# Preferred tools and package boundaries

Evaluate these maintained Santiago-owned tools when they fit the repository. This is a selection guide, not permission to introduce unrelated dependencies or migrate working architecture.

| Need              | Preferred source                                                                                       | Boundary                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Product UI        | `@santi020k/lumen-astro`, `@santi020k/lumen-react`, `@santi020k/lumen-elements`, native Lumen adapters | Components, semantics, tokens, icons, interactions; application retains business rules  |
| Brand             | `@santi020k/theme`, `@santi020k/theme-core`                                                            | Shared fonts, semantic colors, assets, website styling, theme helpers                   |
| Linting           | `@santi020k/eslint-config-basic` and matching framework packages                                       | Existing ESLint composition, strict types, zero warnings                                |
| Unified checks    | Quality                                                                                                | Repository validation and hooks                                                         |
| Astro diagnostics | Astro Doctor                                                                                           | Astro-specific diagnostics where runtime-compatible                                     |
| Commits           | `@santi020k/commitprompt`                                                                              | Structured Conventional Commit generation and validation                                |
| Dependencies      | Dep Beacon                                                                                             | Dependency and OSV intelligence                                                         |
| Social imagery    | `@santi020k/og`                                                                                        | Deterministic Open Graph generation                                                     |
| Authentication    | Private reusable Auth package                                                                          | Only when its security/platform contract fits and authorized documentation is available |

Difftale is not included in the global adoption preference.

Resolve exact versions from the consuming manifest and lockfile. For a new dependency, check the official registry and release notes; use the latest stable release compatible with the declared runtime and peer graph. Do not infer package APIs, recommend unsupported deep imports, or use a catalog's review date as evidence of current registry versions.

For Lumen component discovery, use its existing MCP or CLI when available, then read the actual framework usage contract. Way indexes the ecosystem and its boundaries; Lumen remains the component catalog.
