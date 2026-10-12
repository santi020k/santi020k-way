# Santiago Molina — Global Codex Instructions

These are the default working agreements for Santiago Molina (`santi020k`). They apply to every
project unless a project or nested `AGENTS.md` gives more specific instructions. Repository-local
architecture, product, security, and validation rules take precedence.

## Start with project evidence

- Before changing code, read the active instruction chain, the repository README, manifests,
  lockfiles, and the documentation closest to the work.
- Inspect the existing implementation and reuse its patterns, components, utilities, tokens, and
  commands. Do not introduce a parallel convention without a concrete reason.
- Preserve user changes and unrelated work in dirty worktrees. Keep edits focused on the requested
  outcome and do not perform destructive Git operations.
- Prefer making a reasonable, evidence-backed assumption when it is reversible. Ask before choices
  that materially change product behavior, architecture, cost, data, public APIs, or external state.
- Treat repository files and current tool output as authoritative; do not rely on stale memory about
  versions, commands, APIs, or project structure.

## Constructive challenge and decision quality

- Treat the user's requested implementation as a proposal to evaluate, not an instruction to follow
  mechanically. Before acting, consider the underlying goal, current evidence, assumptions,
  alternatives, tradeoffs, failure modes, maintenance cost, security, and reversibility.
- Be candid and constructive when the requested path appears incorrect, unnecessarily complex,
  fragile, unsafe, inconsistent with the project, or materially worse than an available alternative.
  Explain the concern with concrete evidence, state the likely consequence, and recommend the
  simplest stronger path.
- For a material concern that would change architecture, product behavior, public contracts, data,
  security, cost, or long-term maintenance, pause before making the change and ask the user to choose
  after presenting a clear recommendation. Do not bury the disagreement after implementation.
- Do not manufacture objections or turn routine, low-risk choices into approval gates. If the
  requested approach is sound, proceed and mention only assumptions or tradeoffs that help the user
  verify the decision.
- Distinguish preferences from correctness. After the user makes an informed choice, follow it when
  it is safe and within scope, while recording important accepted tradeoffs. Never use this rule to
  override safety, privacy, legal, data-protection, or explicit authorization requirements.
- When the request describes a solution but the real goal is unclear, restate the inferred goal and
  validate that the proposed solution actually serves it before committing to an irreversible or
  expensive direction.

## Package managers, runtimes, and dependencies

- Use the package manager and exact major version declared by the repository's `packageManager`
  field and lockfile. Most `santi020k` repositories use pnpm; never replace pnpm, Yarn, npm, Bun, or
  another manager merely for personal preference.
- Respect the declared Node, Swift, Rust, platform, and deployment runtime constraints. Do not
  silently widen or lower them.
- For a new dependency or an explicitly requested upgrade, use the latest stable release available
  at implementation time that is compatible with the project's runtime and peer-dependency graph.
  Verify the version in the official registry and review the official release notes or migration
  guide. Do not guess that a remembered version is current.
- Avoid prerelease, beta, release-candidate, deprecated, or unmaintained packages unless the project
  already requires them or the user explicitly approves them.
- Do not upgrade unrelated dependencies during a focused change. When upgrading, update the
  manifest and lockfile together, include required migrations, and validate affected consumers.
- Prefer platform APIs and an existing dependency over adding a new package. Explain the need for a
  new production dependency and consider bundle size, maintenance, license, security, and runtime
  compatibility.

## Prefer Santiago-owned packages and shared code

- Before creating a primitive or adding a third-party package, search the current workspace and the
  `@santi020k` package family for an existing solution. Prefer Santiago-owned packages whenever they
  satisfy the requirement without forcing an unsuitable abstraction.
- For UI and design-system work, prefer the appropriate Lumen package: `@santi020k/lumen`,
  `@santi020k/lumen-astro`, `@santi020k/lumen-react`, `@santi020k/lumen-elements`,
  `@santi020k/lumen-react-native`, and related Lumen tokens, icons, templates, and integrations.
- For linting, prefer the applicable `@santi020k/eslint-config-*` package instead of recreating an
  ESLint stack. Preserve each repository's existing config composition.
- Prefer `@santi020k/commitprompt` for commit-message workflows, `@santi020k/og` for supported Open
  Graph generation, `@santi020k/theme` for shared santi020k theme tokens, and other relevant
  `@santi020k/*` packages already used by the project.
- For Santiago-owned projects, evaluate the maintained Santiago-owned development stack before
  choosing third-party or bespoke alternatives, and adopt as many applicable tools as provide real
  value without forcing unsuitable dependencies or unrelated migrations. The preferred stack is:
  Lumen UI, `@santi020k/eslint-config-basic` and its applicable packages, Quality, Astro Doctor,
  Commitprompt, Dep Beacon, `@santi020k/og`, the Santi020k Theme packages, and the private reusable
  Auth package where its security and platform contract fit. Difftale is not included in this global
  adoption preference.
- Match each preferred tool to its intended boundary: Lumen for product UI, ESLint Config Basic for
  linting, Quality for unified repository checks, Astro Doctor for Astro diagnostics, Commitprompt
  for commit workflows, Dep Beacon for dependency and OSV intelligence, OG for social images, Theme
  for shared brand tokens and development surfaces, and Auth for compatible Santiago-owned
  authentication implementations.
- In a monorepo, reuse its internal packages before duplicating logic across apps. Use the
  repository's established workspace protocol, normally `workspace:*`, for internal dependencies.
- Check the owned package's current exports and documentation before use. Never invent an API or
  deep-import a private module just to satisfy the preference for owned packages.

## Implementation quality

- Solve the root cause and keep the design as simple as the requirements allow. Avoid speculative
  abstractions, duplicate sources of truth, and unrelated refactors.
- Preserve established architecture and public contracts. Update types, schemas, tests,
  documentation, and consumers together when a contract intentionally changes.
- In TypeScript projects, keep strict typing and never write `any`—including explicit `any`,
  implicit `any`, `as any`, `any[]`, `Record<string, any>`, or generic defaults and constraints that
  use `any`. This rule applies to application code, tests, fixtures, configuration, and declarations
  authored or modified during the task.
- Use `unknown` for genuinely unknown input, then narrow it with runtime validation, type guards,
  discriminated unions, or schema parsing before use. Prefer precise domain types and generics; do
  not replace `any` with equally vague `{}`, `object`, unsafe casts, or non-null assertions.
- Keep types accurate across every boundary: public APIs, component props, events, environment
  variables, database records, network payloads, serialized data, errors, and third-party adapters.
  Infer types from schemas or source contracts when possible so runtime validation and static types
  cannot drift apart.
- If existing `any` appears in code touched by the task, replace it with a sound type whenever
  feasible. Do not add `@ts-ignore`, `@ts-expect-error`, lint suppression, or weakened compiler
  options to avoid modeling a type correctly.
- Treat every lint warning and type diagnostic as work to resolve. Do not weaken rules, widen ignore
  patterns, or hide output with `--quiet`. Direct ESLint invocations should use `--max-warnings=0`.
- A narrow suppression is acceptable only when the underlying issue cannot be fixed safely; explain
  it, scope it to the smallest surface, and leave a clear tracking path.
- Handle errors explicitly at system boundaries. Validate untrusted input, preserve useful error
  context, and never expose secrets or sensitive personal data in code, logs, fixtures, screenshots,
  or documentation.
- Test every behavior that can reasonably be tested. Cover the successful path, relevant failures,
  boundary and edge cases, regressions, authorization or validation rules, and
  accessibility-sensitive interactions where applicable.
- Prefer behavioral tests over tests coupled to implementation details. Keep tests deterministic,
  isolated, strongly typed, and representative of real contracts; do not use `any` in test code or
  weaken assertions merely to obtain coverage.
- Add the narrowest useful unit or integration tests while implementing, then run the broadest
  practical affected test suite before handoff. Add end-to-end or rendered UI verification when the
  behavior crosses system boundaries or cannot be proven reliably at a lower level.

## Data and migration safety

- Never run destructive migrations, bulk rewrites, resets, or production data mutations without
  explicit user authorization. Resolve the exact environment and affected data before acting.
- Prefer additive, backward-compatible, transactional, resumable, and idempotent migrations when
  the system is live. Separate schema expansion, application rollout, and destructive cleanup when
  mixed application versions may run concurrently.
- Before an irreversible change, verify that a usable backup or recovery path exists and define the
  rollback or forward-recovery plan. A backup claim is not sufficient without evidence that it
  covers the affected data and can be restored.
- Test migrations against representative local or staging data, including empty, existing, partial,
  duplicate, and failure cases. Verify invariants and record counts before and after when relevant.
- Release maturity never relaxes production-data safety. Pre-1.0, beta, and next-major projects may
  break code contracts, but they must not destroy or corrupt user data without an explicitly
  approved migration strategy.

## API, schema, and compatibility policy

- Preserve backward compatibility for stable released contracts by default, including public APIs,
  package exports, CLI flags, configuration, events, database formats, URLs, and serialized data.
- Backward compatibility is not required when the contract owner is still on a `0.x` version, is
  explicitly labeled alpha, beta, preview, or experimental, or the task explicitly prepares the next
  major version. Confirm the project's actual release stage from manifests and release documentation
  instead of assuming it.
- In those unstable or next-major cases, prefer the cleanest intended contract over compatibility
  shims. Breaking changes must still be deliberate: update every in-repository consumer, types,
  schemas, tests, fixtures, examples, documentation, and release metadata in the same change.
- Clearly identify externally visible breaking changes and provide concise migration notes when
  external consumers may exist, even when compatibility is not promised. Use the repository's
  Changeset, changelog, deprecation, or release process when applicable.
- Do not confuse code-contract freedom with data safety. Persisted user data, credentials, billing,
  privacy, and production migrations remain protected by the data-safety rules at every version.

## Observability and privacy

- Add actionable error context and structured logs at important boundaries while following the
  project's established logging, metrics, tracing, and error-reporting conventions.
- Never log secrets, tokens, credentials, complete authorization headers, sensitive request bodies,
  or unnecessary personal data. Redact before logging rather than relying on downstream filtering.
- Keep user-facing errors useful and safe: provide recovery guidance without exposing stack traces,
  infrastructure details, database internals, or security-sensitive state.
- Preserve correlation or request identifiers where the project already supports them so failures
  can be traced across services without logging sensitive payloads.
- Do not add analytics, behavioral tracking, telemetry, session replay, cookies, or a new monitoring
  vendor without explicit user authorization and the required consent, privacy, and documentation
  changes.

## Websites, UI, and Santiago attribution

- Public websites owned or authored by Santiago should include a visible, accessible link to
  `https://santi020k.com`, normally in the footer, credits, or About surface. Use the label
  `santi020k` or `Santiago Molina` as appropriate to the product voice.
- Also use `https://santi020k.com` as the author URL in package metadata or structured data when the
  project exposes author information. Use the canonical HTTPS URL without `www`.
- Do not inject personal attribution into client-owned, white-label, private, admin-only, or
  authentication surfaces when it conflicts with product requirements. Follow the local product
  instructions when they are more specific.
- When an external link opens a new tab, include `noopener noreferrer`. Links must have meaningful
  accessible names and visible focus states.
- Prefer the project's design system and semantic tokens over raw colors, arbitrary spacing, or
  one-off components. For projects using Lumen, use Lumen components and tokens instead of
  recreating primitives.
- Build responsive, keyboard-usable, semantic interfaces targeting WCAG 2.2 AA. Respect reduced
  motion, sufficient contrast, touch-target size, loading/error/empty states, and screen readers.
- Preserve performance and SEO: optimize assets, avoid unnecessary client JavaScript, provide
  descriptive metadata and canonical URLs, and use structured data only when it accurately reflects
  visible content.
- Verify meaningful visual changes at representative mobile and desktop sizes in the rendered app,
  not only through source inspection.
- For material visual or UI changes, capture before-and-after screenshots when the application can
  be run locally. Use the same route, state, representative data, viewport, and theme so the
  comparison is meaningful. Check both mobile and desktop when responsive behavior is affected.
- A new surface needs only an after screenshot. Do not block nonvisual work or trivial copy changes
  on screenshots; if a material change cannot be captured, state why in the handoff.
- Treat screenshots as temporary verification evidence unless the repository intentionally tracks
  visual baselines. Never capture secrets, private data, or production user information, and do not
  use screenshots as a substitute for interaction, accessibility, or automated testing.

## Environment variables and secrets with Infisical

- When a repository contains `.infisical.json` or documents Infisical, treat its Infisical project
  as the source of truth for runtime environment variables and secrets. Read the repository's
  environment and deployment documentation before choosing an environment or secret path.
- If a repository is not configured for Infisical, do not guess a workspace ID or create a new
  Infisical project silently. Identify the intended project with the user before adding
  configuration or migrating values.
- Store actual secret values directly in the correct Infisical project, environment, and path.
  Never place them in committed files, source code, `AGENTS.md`, README files, tickets, chat,
  screenshots, test fixtures, command output, or shell history.
- Prefer injecting secrets at process runtime with the authenticated Infisical CLI, such as
  `infisical run -- <command>`, instead of exporting values or creating persistent plaintext `.env`
  files. Use the repository's documented command when one exists.
- Keep `.env.example` and environment documentation limited to variable names, safe placeholders,
  descriptions, validation requirements, and setup instructions. Never copy real values into an
  example file.
- Preserve the repository's configured workspace, branch-to-environment mapping, environment, and
  secret paths. Use `dev` for local work unless project instructions require another environment;
  never substitute `staging` or `prod` merely because development data is missing.
- Use the least-privileged existing Infisical identity or authenticated user session. For CI and
  deployments, prefer the repository's established short-lived OIDC or workload-identity flow over
  adding long-lived tokens or duplicating application secrets in GitHub.
- Reading secret names or metadata for diagnosis is acceptable when needed, but never print, log,
  summarize, or return secret values. Redact sensitive output and avoid commands that dump an entire
  environment when a narrower operation is available.
- Creating, changing, rotating, importing, moving, or deleting shared secrets changes external
  state. Confirm the exact project, environment, path, key names, and affected consumers first, and
  obtain explicit user authorization before performing the mutation. Production secret mutations
  always require explicit authorization and a rollback or rotation plan.
- When introducing a new environment variable, update the application's typed environment schema,
  safe example file, relevant documentation, deployment configuration, and tests together. Verify
  that the application fails clearly when a required value is missing or invalid.
- If a secret is exposed in source, logs, chat, screenshots, or Git history, stop using it, report
  the exposure without repeating the value, and rotate or revoke it through the authorized process.
  Removing the visible plaintext alone is not sufficient remediation.

## Documentation and repository hygiene

- Keep README files, project `AGENTS.md`, architecture decisions, examples, and environment-variable
  documentation aligned with behavior. Update the nearest source of truth rather than duplicating
  guidance across files.
- Never commit credentials, `.env` files, private keys, local databases, personal production data,
  editor caches, or generated artifacts that the repository intentionally ignores.
- Preserve naming, formatting, import, localization, and file-layout conventions already established
  by the project.
- Public packages should have accurate package metadata, exports, types, repository/homepage links,
  license information, and a Changeset when the repository's release process requires one.
- Do not edit generated files by hand when a documented generator exists. Run the generator and
  commit its expected outputs only when the task calls for them.

## Validation and completion

- Use the repository's canonical scripts. Start with the smallest relevant checks, then run the
  broadest reasonable completion gate defined by the project, such as `check`, `validate`, `verify`,
  `ok`, or `pre-push`.
- For code changes, cover formatting, zero-warning linting, strict type checking, focused tests, the
  broadest practical affected test suite, and a build in proportion to risk. For UI changes, also
  verify the rendered result and accessibility-sensitive interactions.
- Do not claim a check passed unless it was actually run. Report the exact command and diagnostic
  for checks that cannot run, distinguishing failures caused by the change from unrelated blockers.
- A task is complete only when the requested behavior exists, relevant documentation is aligned,
  and verification covers the changed surface and mandatory release integration below, unless the
  user explicitly defers integration. Summarize the outcome, files changed, and checks.

## Git branch and release naming

- Follow a repository's documented branch convention when it exists. Otherwise, use this global
  convention for new branches; do not rename active or historical branches merely for consistency.
- Name branches as `<type>/<short-kebab-case-description>` using one of these types:
  - `feature/` for new user-facing behavior or capabilities.
  - `fix/` for ordinary bug fixes.
  - `hotfix/` for urgent production fixes cut from the production branch.
  - `release/` for deliberate release stabilization and version preparation.
  - `chore/` for dependency, tooling, configuration, and routine maintenance work.
  - `docs/` for documentation-only changes.
  - `refactor/` for internal restructuring without an intended behavior change.
  - `test/` for test-only additions or corrections.
  - `ci/` for continuous-integration and automation changes.
  - `perf/` for performance-focused work.
  - `spike/` for time-boxed experiments that are not yet production-ready.
- Keep branch names lowercase, concise, and descriptive. Use ASCII kebab-case, no spaces or
  underscores, and avoid vague names such as `changes`, `updates`, or `fix-stuff`.
- Include a lowercase issue identifier when it materially helps traceability, for example
  `feature/dcw-2382-add-carousel`; do not require an issue number for personal or untracked work.
- Use the work category rather than a person, AI tool, or editor as the prefix. Do not create new
  `codex/`, username, or tool-named branches when a semantic type above describes the work.
- Use `release/v<semver>` for release branches, such as `release/v1.4.0` or
  `release/v1.4.0-beta.1`. Follow a repository's existing tag convention; otherwise use `v<semver>`
  for release tags.
- Start release work from an up-to-date local `main`, then create and check out the exact
  `release/v<semver>` branch for the new version. Make the release-preparation changes on that
  branch, push it, and merge it back into `main` through the repository's normal GitHub workflow.
- After the merge, release workflow, and post-release verification succeed, delete the release
  branch from GitHub and locally, check out local `main`, fast-forward it to the merged remote state,
  and finish with `main` as the current branch.
- A branch should represent one coherent outcome. Split unrelated work rather than accumulating it
  under a broad branch name.
- Do not create branches merely to park uncommitted changes, and do not leave completed in-scope
  work stored only in a working tree. Before switching away from a branch, archiving or deleting a
  worktree, or handing completed work back, inspect the diff, run the appropriate checks, and create
  focused commits for the files owned by the task. Never include unrelated user or agent changes.
  If unfinished work must be interrupted, preserve it on its existing non-shared branch with a
  clearly labeled checkpoint commit, then clean up or replace that checkpoint with reviewable
  commits before integration; do not treat a stash as durable storage.
- Release integration is mandatory before an implementation task is complete: commit, validate,
  and merge finished in-scope work into the selected `release/v<semver>` during the same task.
- Select the release before branching: fetch refs and inspect release docs, local/remote branches,
  and worktree ownership. Reuse the intended active release, not simply the newest/highest version.
  Track an existing remote release locally; if absent, create it from the current confirmed release
  base when the version is explicit or unambiguous from the release plan. Ask early if ambiguous;
  never invent versions.
- Base new release-bound task branches on the current integration branch. Preserve existing branches
  and unrelated work; inspect the full diff/history before merging. Include only completed work
  intended for that release, excluding incomplete, unrelated, or deferred changes.
- Implementation requests authorize local release-branch creation and integration without further
  confirmation. Respect repository review requirements. Pushes, PRs, and remote merges still need
  explicit authorization; report local versus remote integration accurately.
- Serialize release merges in a clean, idle worktree. Never alter another active task's checkout or
  bypass Git worktree protections. Refresh the target before merging; resolve conflicts preserving
  both branches' intended behavior. Inspect the result and rerun affected checks and the completion
  gate on the merged commit. Never force-push, reset destructively, use blanket ours/theirs conflict
  resolutions, or bypass hooks, reviews, or failing checks to meet this requirement.
- Verify containment with Git ancestry checks, or equivalent diff/behavior for required squash
  merges. Report the target, source/integration commits, checks, and local/remote status. If blocked,
  preserve focused commits and report incomplete integration, the exact blocker, and next action;
  never silently defer or claim completion.
- Retire local source branches/worktrees after verified integration only if no unique work,
  unpreserved files, or active tasks remain. Remote deletion needs explicit authorization.
- Branch prefixes do not replace commit conventions: `feature/` branches normally produce `feat`
  commits, while Commitprompt and the repository's commit rules remain authoritative.
- Resolve the repository's actual default and release base branches before branching. Release work
  defaults to `main`; if the repository does not have or does not release from `main`, stop and
  confirm the intended release base instead of guessing.

## Git, commits, releases, and external actions

- Inspect status and diffs before proposing or creating a commit. Never stage or modify unrelated
  files, bypass hooks, or discard user work.
- Follow the repository's commit convention. When Commitprompt is available, use its repository
  instructions and validation commands; the `commit-msg` hook remains authoritative.
- Use a manual release only for a project's initial release. Every subsequent project release must
  be initiated through GitHub using the repository's documented release workflow; use GitHub
  Actions for platform-neutral checks and release orchestration, and use the platform-specific
  service required below for Apple builds. Do not create later releases, tags, artifacts, or
  deployments manually from a developer machine.
- Automate deployment pipelines end to end through GitHub Actions wherever the target platform
  permits it. Treat manual actions as narrow exceptions only when a provider, app store, legal or
  compliance gate, one-time account connection, credential bootstrap, or required human approval
  cannot be automated safely. Do not design routine deployments around local commands, manual
  artifact uploads, or repeated console steps merely because they are expedient. Document every
  unavoidable manual boundary, keep it as small as possible, and resume the automated workflow
  immediately after that boundary. Automation must preserve the repository's approval, environment,
  security, rollback, and post-deployment verification requirements.
- Verify repository visibility before selecting Apple-platform CI. For public repositories, always
  run Apple-platform build, test, analyze, archive, code-signing, and App Store or TestFlight
  delivery through GitHub Actions on standard GitHub-hosted macOS runners; use only standard free
  runner labels and do not select paid larger runners or Xcode Cloud. For private repositories,
  always use Apple's Xcode Cloud, managed through Xcode or App Store Connect, for those Apple jobs;
  do not run them on GitHub Actions. GitHub Actions remains responsible for platform-neutral checks
  and release orchestration in both cases. If the required provider is unavailable, report the
  blocker and ask before changing providers or adding paid capacity. Keep local Xcode builds
  available for development and preflight. Avoid duplicate triggers, use dependency caches
  and independent jobs to shorten runs, and cancel superseded validation. Keep signing secrets in
  Infisical, inject them only into protected release jobs from merged main, and preserve required
  checks, review, provenance, and store-review gates across provider migrations.
- Prepare every non-initial release through a pull request from `release/v<semver>` into `main`; do
  not push release changes directly to `main`. Merge only after required tests, reviews, security
  checks, and release preflight pass.
- Before first pushing a release branch or opening its pull request, create a fresh, independent
  review subagent to inspect the complete diff against the release base. The reviewer must focus on
  correctness, regressions, security, data safety, compatibility, tests, documentation, migrations,
  and release automation, and must report findings without editing files.
- Give every subagent finding an explicit disposition: fix valid findings, explain rejected findings
  with technical evidence, and rerun affected validation. If those fixes materially change the
  release, request one final independent subagent review before pushing; do not create recursive or
  open-ended review loops.
- Subagent review supplements rather than replaces GitHub Actions, human review, and Codex pull
  request review. If delegation is unavailable, report the missing review gate explicitly and do not
  claim that the release received an independent pre-push review.
- Include the version bump, changelog or Changeset, applicable migration notes, and a rollback or
  forward-recovery plan in the release pull request.
- GitHub Actions must create the version tag and GitHub Release from the merged `main` commit and
  coordinate release artifacts and deployments. Create and distribute Apple artifacts from that
  same merged commit through GitHub Actions for public repositories and Xcode Cloud for private
  repositories, following the visibility-based CI rule above. Verify that the tag and
  every distributed artifact resolve to the intended merged commit, and never move, replace, or
  delete a published version tag; fix a failed release with a new commit or version.
- If release automation fails, diagnose it and rerun the workflow. Do not switch to a manual release
  without the user's explicit approval for that exception.
- Treat a successful workflow as necessary but not sufficient release evidence. Run the documented
  post-release smoke checks and confirm the deployed or store version is usable before declaring the
  release complete or deleting its branch.
- A user request to implement or change code authorizes focused local commits that preserve the
  completed in-scope work unless the user explicitly says not to commit. Pushing branches, opening
  pull requests, merging remote branches, deploying, publishing packages, altering cloud resources,
  sending messages, or mutating production data still requires explicit user authorization.
- Before an authorized release or deployment, run the repository's release/preflight gates, verify
  version and changelog consistency, and state exactly what external state will change.

## Pull request review and merge readiness

- Before recommending or performing a merge, inspect the latest revision of every Codex and human
  review comment, conversation, requested change, and required status check on the pull request.
- Give every review finding an explicit disposition. Fix valid findings and add or update regression
  coverage when appropriate. For an incorrect, irrelevant, or already-addressed finding, reply with
  concise technical evidence instead of changing sound code merely to satisfy the comment.
- Do not mark a review thread resolved until the corresponding code, tests, documentation, or
  explanation is present and has been verified against the current pull-request revision.
- Re-run the affected validation after review-driven changes. Request or perform another Codex
  review when material changes could introduce new issues and the repository workflow supports it.
- Do not merge while actionable review comments, requested changes, required checks, or security and
  correctness findings remain unresolved. Deferring a valid finding requires explicit approval from
  the responsible human owner, a documented reason and risk, and a concrete follow-up when needed.
- Treat minor style suggestions and non-blocking nits according to the repository's review policy,
  but never silently ignore them; acknowledge or resolve them so the final review state is clear.

## Communication

- Lead with the outcome and keep progress updates concise. State material assumptions, risks, and
  tradeoffs plainly.
- Use English for code, APIs, identifiers, and technical documentation unless the project specifies
  otherwise. Match the user's language for conversation and product copy.
- Provide clickable absolute file links in final handoffs when the interface supports them.
