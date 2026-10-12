# Preferred tools and package boundaries

Evaluate these maintained Santiago-owned tools when they fit the repository. This is a selection guide, not permission to introduce unrelated dependencies or migrate working architecture.

| Need              | Preferred source                                                            | Boundary                                                                                |
| ----------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Product UI        | [Lumen](#lumen): the matching web or native adapter                         | Components, semantics, tokens, icons, interactions; application retains business rules  |
| Brand             | [Theme](#theme): `@santi020k/theme`, `@santi020k/theme-core`                | Shared semantic colors, typography, assets, website styling, theme helpers              |
| Linting           | [ESLint Config Basic](#eslint-config-basic) and matching framework packages | Existing ESLint composition, strict types, zero warnings                                |
| Unified checks    | [Quality](#quality)                                                         | Repository validation and hooks                                                         |
| Astro diagnostics | [Astro Doctor](#astro-doctor)                                               | Astro-specific diagnostics where runtime-compatible                                     |
| Commits           | [Commitprompt](#commitprompt)                                               | Structured Conventional Commit generation and validation                                |
| Dependencies      | [Dep Beacon](#dep-beacon)                                                   | Dependency and OSV intelligence                                                         |
| Social imagery    | [OG](#og): `@santi020k/og`                                                  | Deterministic Open Graph generation                                                     |
| Authentication    | [Auth](#auth): the approved reusable package                                | Only when its security/platform contract fits and authorized documentation is available |

Difftale is not included in the global adoption preference.

Resolve exact versions from the consuming manifest and lockfile. For a new dependency, check the official registry and release notes; use the latest stable release compatible with the declared runtime and peer graph. Do not infer package APIs, recommend unsupported deep imports, or use a catalog's review date as evidence of current registry versions.

For Lumen component discovery, use its existing MCP or CLI when available, then read the actual framework usage contract. Way indexes the ecosystem and its boundaries; Lumen remains the component catalog.

## Using these guides

Read the section relevant to the requested work. Examples use pnpm; keep the consumer's declared package manager, runtime, existing configuration, and release stage. Check the installed tool's help and exports before copying an example. The linked upstream documentation owns complete APIs and migration instructions; these guides do not pin registry versions.

Before adoption, identify the concrete need, inspect existing dependencies and configuration, and choose the smallest compatible integration. After adoption, verify real behavior through the consuming repository's canonical gate. A package in a manifest, a generated config, or a successful preview alone does not prove the integration works. Record material incompatibilities or intentional exceptions in the nearest project documentation instead of repeatedly recommending an unsuitable tool.

## Lumen

**Use when:** building product UI on a supported framework. Choose `@santi020k/lumen-astro`, `@santi020k/lumen-react`, or `@santi020k/lumen-elements` for the existing web stack; consult the platform guide for native adapters. Skip a framework migration or a second component system merely to adopt Lumen.

**Minimum setup:** install the matching adapter, import its public stylesheet once, and configure its documented runtime. Astro interactive primitives need `UIPrimitives` once in the root layout; React and Web Components have their own behavior contracts. Use the MCP, installed exports, or upstream component docs to verify the selected component's props and events.

For an Astro root layout that needs interactive primitives:

```astro
---
import '@santi020k/lumen-astro/styles.css'
import UIPrimitives from '@santi020k/lumen-astro/runtime'
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Example application</title>
  </head>
  <body>
    <slot />
    <UIPrimitives />
  </body>
</html>
```

**Verify:** type-check and build the consumer; exercise the actual interaction with keyboard, focus, touch, both themes, and reduced motion at mobile and desktop sizes. Business rules and application state stay in the consumer.

**Source:** [Lumen platform and component documentation](https://lumen.santi020k.com/docs).

## Theme

**Use when:** a surface needs Santiago's brand tokens, typography, or assets. Preserve client and white-label branding; do not install a personal editor theme as part of an application change.

**Minimum setup:** select the public export for the surface. `@santi020k/theme/site.css` supplies website-ready color and typography variables; `tokens.css` exposes raw HSL values and Tailwind mappings. Inspect `@santi020k/theme-core` only when a reusable token integration needs its documented contract. Keep Lumen in charge of component behavior.

For a branded website stylesheet:

```css
@import '@santi020k/theme/site.css';

.project-summary {
  color: var(--ink);
  background: var(--surface);
}
```

**Verify:** render light and dark appearances, check contrast and focus, and inspect font requests. Serve Montserrat locally with its license; font-family variables alone do not supply font files. Avoid mixing raw HSL tokens with CSS-ready colors or importing both exports as competing palettes.

**Source:** [Theme exports and usage](https://github.com/santi020k/santi020k-theme/blob/main/packages/theme/README.md).

## ESLint Config Basic

**Use when:** a JavaScript or TypeScript project needs shared lint policy. Add only matching framework and feature packages. Do not add ESLint to a native-only repository solely for uniformity.

**Minimum setup:** inspect the existing flat config, then select compatible `eslint`, `@santi020k/eslint-config-basic`, and any required framework peers. Preserve local composition; use this minimal example only when establishing a new config:

```js
import { defineConfig } from '@santi020k/eslint-config-basic'

export default defineConfig()
```

Run the canonical lint script. A direct diagnostic invocation must reject warnings:

```sh
pnpm exec eslint . --max-warnings=0
```

**Verify:** lint representative source and test files and run the consumer's separate strict type check. Check the resolved configuration when files appear unexamined. Fix diagnostics rather than adding ignores, suppressions, or weaker rules; lint success does not replace type checking.

**Source:** [ESLint Config installation and framework guides](https://eslint.santi020k.com/).

## Quality

**Use when:** repository checks and Git hooks need one maintained entry point across supported languages. Quality is a native CLI that orchestrates existing analyzers and project commands. It does not replace those analyzers or require a new npm dependency.

**Minimum setup:** install a compatible release using the upstream instructions, then inspect the existing `quality.yml`. For first adoption, preview detection before applying configuration:

```sh
quality init --dry-run
quality doctor
quality check --dry-run
```

Apply the reviewed configuration with `quality init` when needed. Preserve existing hook steps; run `quality hooks install` when repository hook installation is part of the task. A task that invokes `pnpm check` must not point back to a script that invokes the same Quality task recursively.

**Verify:** run `quality check` and `quality hooks status` where hooks are configured. Confirm the intended lint, types, tests, and build commands actually run. A dry run or an empty check plan is not completion evidence; do not baseline away feasible diagnostics.

**Source:** [Quality setup, adapters, and hooks](https://quality.santi020k.com/); use the matching release's README and local `quality --help` when online documentation is unavailable.

## Astro Doctor

**Use when:** an Astro application needs Astro-specific performance, accessibility, security, and correctness diagnostics. Skip non-Astro projects and incompatible runtimes; do not raise a consumer's Node requirement silently.

**Minimum setup:** select a compatible `@santi020k/astro-doctor` release as a development tool. Choose the CLI or integrate `@santi020k/eslint-plugin-astro-doctor` through the existing ESLint composition. Avoid running the same rules twice without a reason.

For a consumer with the CLI installed:

```sh
pnpm exec astro-doctor --fail-on warning
```

Add that command to the canonical check only after confirming compatibility and addressing its findings. Agent-skill installation is a separate operation; a diagnostic scan does not require modifying agent configuration.

**Verify:** scan the actual Astro source, resolve warnings, and run the existing Astro type check, build, and relevant browser checks. A diagnostic score alone does not establish accessibility or runtime correctness.

**Source:** [Astro Doctor CLI and integration reference](https://github.com/santi020k/astro-doctor).

## Commitprompt

**Use when:** a repository uses Conventional Commits and needs consistent interactive or automated messages. Keep its Commitlint rules and existing hook checks. Do not change global editor settings as part of repository setup.

**Minimum setup:** use `@santi020k/commitprompt` as a development dependency and a `commit` script that invokes `commitprompt`. Inspect existing project setup before changing it; versions supporting `setup project --dry-run` can preview the dependency, script, hook, and instruction changes. The `commit-msg` hook validates messages from Git and editors as well as the prompt.

For an agent preparing a message after inspecting the intended diff:

```sh
pnpm exec commitprompt types --json
pnpm exec commitprompt instructions --json
pnpm exec commitprompt format --json <<'JSON'
{"type":"docs","scope":"","subject":"document tool usage","body":"","breaking":"","issues":""}
JSON
printf '%s\n' 'docs: document tool usage' | pnpm exec commitprompt validate --json
```

Use a type allowed by the discovered repository rules. Validate the exact formatted message before a commit authorized by the task; these discovery and formatting commands do not create a commit. Keep hooks enabled and stage only in-scope files.

**Verify:** check that the configured hook invokes message validation and that the exact message satisfies the repository's rules. A generated message is a proposal until validation succeeds.

**Source:** [Commitprompt setup and structured-input reference](https://github.com/santi020k/commitprompt/blob/main/packages/commitprompt/README.md).

## Dep Beacon

**Use when:** npm ecosystem dependency work needs version, semver, workspace-catalog, or OSV signals. For editor assistance, choose the supported VS Code or Zed integration. Use `@santi020k/dep-beacon-core` only when building an actual analysis integration; ordinary applications do not need it as a runtime dependency.

**Minimum setup and example:** install the selected editor integration when requested, then open the consumer's `package.json` or `pnpm-workspace.yaml`. Inspect a dependency's resolved range, suggested update targets, and advisory details before choosing a scoped update. Editor setup and network-backed registry/advisory lookups must respect the project's access policy.

**Verify:** confirm diagnostics refer to the intended manifest or catalog entry. Review the official release notes, runtime and peer compatibility, and resulting manifest/lockfile diff; run the affected consumer checks. Distinguish failed or unavailable advisory lookups from an empty vulnerability result. Suggested updates are evidence for a decision, not permission for a bulk upgrade.

**Source:** [Dep Beacon editor setup and package boundaries](https://github.com/santi020k/dep-beacon).

## OG

**Use when:** public pages need reproducible Open Graph images. Prefer `@santi020k/og` as a development dependency for static generation. Skip private-only surfaces that do not need social previews and preserve existing robots and privacy rules.

**Minimum setup:** inspect the existing image pipeline and `og.config.mjs`. For a new integration, initialize and review the generated card definitions before generating outputs:

```sh
pnpm exec santi-og init
pnpm exec santi-og generate
pnpm exec santi-og check
```

Run `init` only when creating configuration. Keep copy, branding, fonts, assets, and output destinations in the consumer. If outputs are committed, track their `.og-cache.json` manifest too; if they are build artifacts, generate both in CI. Keep generation explicit and checks non-writing.

**Verify:** inspect generated images, resolve page metadata to the correct public image, and run `santi-og check` after generation. Test long titles and relevant locales. Never place invitation tokens, account information, or other private payloads in social images or metadata.

**Source:** [OG configuration, generation, and integrity checks](https://github.com/santi020k/og/blob/main/packages/og/README.md).

## Auth

**Use when:** the approved reusable authentication package fits a Santiago-owned application's platform and security requirements. Verify each package's availability and released contract from authorized documentation. Do not assume every adapter is public or replace a working login flow solely to standardize dependencies.

**Minimum setup:** read the approved package README, security contract, and the consumer's authentication design. Confirm identity ownership, adapter compatibility, origin and cookie behavior, persistence, recovery, and secret delivery before selecting an integration. When documentation or access is missing, report that gap instead of inventing package imports or copying another application's credentials.

**Example:** for an application adding email-code login, use an isolated local fixture and the documented adapter. Keep identities and authorization rules application-owned; test successful login, invalid or expired codes, logout, and unauthorized access before proposing a rollout. Sharing authentication code must not silently create shared accounts or sessions between products.

**Verify:** run the consumer's authorization and session tests, relevant browser flows, and reviewed migration checks. Separately verify recovery and supported origin behavior. Local tests do not authorize secret mutations, email delivery, production migrations, or deployment.

**Source:** the approved Auth package's README, security documentation, and migration guide available to the consuming repository. Keep private implementation details and credentials out of Way's public catalog.
