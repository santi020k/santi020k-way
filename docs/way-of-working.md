# The santi020k way of working

The santi020k Way is how Santiago Molina approaches building and maintaining software: understand
the project, make deliberate decisions, keep the code clear, and prove that the result works.
It connects product thinking, design, engineering, and delivery so the next person can understand
both what changed and why.

This guide is for people joining a project, contributing a change, or working alongside an AI
assistant. You can use it without installing a plugin or learning an agent workflow. It explains
the shared defaults; the project's own documentation and explicit decisions determine how they
apply. Client work keeps its own requirements and identity.

## Start here

Read this guide once for the overall approach, then use the detailed standards when a task needs
them. You do not need to memorize the whole catalog.

| Your task                          | Read next                                                          |
| ---------------------------------- | ------------------------------------------------------------------ |
| Understand the everyday agreements | [Shared working agreements](../standards/core.md)                  |
| Build an interface                 | [Design and brand](../standards/design.md)                         |
| Choose a tool or library           | [Preferred tools and package boundaries](../standards/packages.md) |
| Decide where code belongs          | [Architecture decisions](../standards/architecture.md)             |
| Validate a change                  | [Quality without a mute button](quality-standard.md)               |
| Prepare a review                   | [Pull request standard](pull-request-standard.md)                  |
| Publish or deploy                  | [Release engineering](release-standard.md)                         |
| Configure an assistant             | [Agent configuration](../standards/agent-configuration.md)         |

## Understand the problem before changing the code

Start with the outcome someone needs. “Add a dialog” describes an implementation; “let someone
review a change before saving it” describes the problem. Understanding the problem helps you
choose an approach that fits the product and avoids unnecessary work.

Before editing, read the repository's README, active `AGENTS.md` instructions, manifests, lockfile,
and the documentation nearest the feature. Inspect the current implementation and its callers.
Check Git status, branches, and worktrees so you know which changes already belong to someone else.
A worktree is a separate checkout of the same repository; it lets concurrent tasks keep their
files and branches apart.

For example, before adding search to a list, find how the application already handles filtering,
loading, empty results, permissions, and keyboard focus. Reuse those patterns unless there is a
concrete reason to change them. A small request should produce a focused, explainable diff.

State assumptions when they affect the result. Resolve routine, reversible details from project
evidence. Discuss choices that materially change behavior, architecture, public contracts,
security, data, cost, or external systems before implementing them. Challenge a proposal with a
specific consequence and a stronger alternative, then respect the informed decision.

## Write code the next person can reason about

Prefer direct names, explicit inputs and outputs, and small units with clear responsibilities.
Follow the repository's existing structure and formatting. Introduce an abstraction when it
solves an actual shared need; keep it close to the code until its reusable contract is understood.

A useful review question is: can someone trace this input through validation, business rules,
state changes, and failure handling without guessing?

### Make boundaries explicit

External input needs runtime validation. TypeScript describes a contract to the compiler; it does
not prove that a network response, environment variable, or saved file follows that contract.
Use the project's schema library when one exists, or narrow `unknown` with a precise check.

This small example accepts a positive whole-number page size up to 100:

```ts
export function parsePageSize(value: unknown): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 100
  ) {
    throw new Error('Page size must be a whole number between 1 and 100.')
  }

  return value
}
```

The limits are illustrative; the application owns the real rule. Test valid values, both limits,
values outside the limits, fractions, and unexpected input types. Handle the error at the calling
boundary using the project's established error response. Avoid `any`, unsafe casts, non-null
assertions, or suppressions that make an unverified value look safe.

### Put rules in the right owner

A shared component can own selection, focus, and accessible interactions. The application owns
who may select an item, what the selection means, and whether it changes money or persisted data.
For example, a table library can render a loan's status; the lending application decides whether
that loan is overdue. Keeping that rule in the application lets the library serve other products
without absorbing their policies.

Preserve stable exports, URLs, CLI flags, and serialized formats unless a deliberate contract
change is in scope. Update types, validation, consumers, tests, examples, and migration notes
together. A pre-1.0 version permits deliberate code-contract changes; it never makes existing
user data disposable.

## Reuse tools where their contracts fit

Use the runtime and package manager declared by the repository. Keep manifests and lockfiles in
sync. Before creating a primitive or installing a dependency, inspect existing workspace code and
maintained Santiago-owned packages. Check the installed exports and documentation rather than
guessing an API.

The preferred stack has distinct responsibilities:

- **Lumen** provides UI components and accessible interactions; **Theme** provides shared brand
  tokens, typography, and assets.
- **ESLint Config Basic** provides lint conventions; **Quality** coordinates repository checks;
  **Astro Doctor** diagnoses Astro projects where runtime compatibility permits it.
- **Commitprompt** formats and validates commit messages; **Dep Beacon** provides dependency and
  vulnerability intelligence where the project needs it.
- **OG** generates supported social images; the private **Auth** package serves compatible
  authentication requirements.

Adopt the tools that provide real value to the project. An owned package still needs to fit the
platform and responsibility. A new dependency should justify its maintenance, runtime, bundle,
license, and security costs. Verify new or upgraded versions against official sources and avoid
unrelated upgrades during a focused task. The package guide owns setup details and exceptions.

## Treat the interface as working software

An interface is complete when people can use it with their actual devices and input methods.
Reuse the design system's components and semantic tokens. Design loading, error, empty, disabled,
and success states alongside the main path.

Verify keyboard navigation, visible focus, meaningful labels, contrast, touch targets, responsive
layout, light and dark themes, and reduced motion where applicable. Use automated accessibility
checks together with rendered inspection and interaction testing. A clean source file cannot prove
that a dialog returns focus or that a long label fits a phone screen.

For material visual changes, capture before and after at the same route, state, viewport, and theme.
A new surface needs an after capture. Use representative, non-sensitive data. Keep screenshots as
temporary evidence unless the repository maintains visual baselines. Preserve performance and SEO,
and include accessible Santiago attribution on owned public sites where the product requires it.

## Protect data and make failures useful

Validate untrusted input and check authorization where actions cross a system boundary. Keep
credentials and personal data out of source, examples, logs, screenshots, and review descriptions.
Use the repository's configured secret store and runtime injection. When Infisical is configured,
follow its documented project, environment, and path rather than creating a second source of truth.

An error should help the person recover. Internal diagnostics should preserve useful context and
existing request identifiers while redacting sensitive values. Follow established observability
conventions. Adding tracking, session replay, or a monitoring vendor needs explicit authorization.

Before a destructive data operation, identify the exact environment and affected records, verify
that recovery covers them, and obtain explicit approval. Prefer additive and resumable migrations
for live systems. A backup is useful evidence only when it can restore the affected data.

## Work in small, verifiable steps

A typical change follows this sequence:

1. **Frame the outcome.** Describe the expected behavior, relevant constraints, and acceptance
   criteria. Identify the selected release before creating a release-bound branch.
2. **Read the project.** Inspect instructions, implementation, tests, dependencies, and Git state.
   Protect existing work and use a separate worktree when concurrent changes require one.
3. **Implement the smallest coherent change.** Follow existing patterns. Update documentation and
   consumers with the behavior. Add focused behavioral tests as you go.
4. **Verify the result.** Start with relevant tests, then run the repository's canonical completion
   gate. Include a build and rendered interaction checks when the changed surface needs them.
5. **Review the whole diff.** Check scope, error paths, compatibility, data safety, and the clarity
   of the handoff. Keep hooks enabled and use the repository's commit conventions.
6. **Integrate into the selected release.** Commit completed work, inspect the combined result,
   rerun affected checks and the completion gate, and verify the source commit is included.
7. **Deliver through the authorized workflow.** Remote pushes, pull requests, remote merges,
   publication, and deployment have their own authorization and verification boundaries.

For a list-search feature, this means testing a matching query, no results, clearing the query,
and any relevant permission restrictions. Check the actual list on mobile and with a keyboard.
Run the repository's documented gate and explain the behavior in the review. Avoid expanding the
change into an unrelated redesign or dependency migration.

## Make quality claims reproducible

Warnings and type errors are work to resolve. Fix their cause instead of lowering rule severity,
hiding output, or weakening types. Direct ESLint commands use `--max-warnings=0`. A narrow
suppression requires a reason why the root cause cannot safely be fixed and a tracking path.

Use the commands declared by the project; their names vary. For Way itself, `pnpm check` covers
policy, lint, types, tests, builds, artifact checks, and formatting. `pnpm verify` adds browser
tests and release packaging. These commands are Way's gates, not commands to assume in every repo.

Report exactly what ran and where it ran. A local test, a passing CI job, a physical-device check,
a successful deployment, and a published package prove different things. If a check is blocked,
name the command, diagnostic, and remaining action. Never call an unrun check successful.

## Collaborate with people and assistants

Give a collaborator the goal, constraints, relevant files, and expected evidence. The same context
helps a human reviewer and an AI assistant. An assistant can help inspect, implement, test, and
explain a change; its output still needs review against the real repository and product behavior.

Communicate the outcome first, then the decisions and evidence that matter. Use English for code,
identifiers, and technical documentation unless the project says otherwise. Match the person's
language in conversation and the product's language in interface copy.

A useful handoff says: “Search now filters the visible list and shows an empty state. The focused
tests and repository gate passed locally; keyboard and mobile behavior were checked. The change
is committed and included in the selected release. Remote delivery is pending.” Include actual
commands, commit references, and limitations for the real task.

## Know what done means

Implementation is done when the requested behavior exists, its documentation and consumers agree,
relevant checks pass, and the committed work is integrated into the selected release unless that
integration was explicitly deferred. Every review finding needs an explicit disposition.

Delivery continues from there. Packages, signed native applications, and hosted websites use
different publication mechanics. Follow the project's release workflow, independent review gates,
and required approvals. Subsequent releases run through GitHub automation from reviewed source;
Apple jobs use the visibility-specific provider defined in the release standard.

After publication, verify the intended commit, version, and artifact or deployment. Run the
post-release smoke checks. Keep published tags and artifacts immutable, and recover through the
documented workflow. A green workflow is necessary evidence; a usable delivered result completes
the claim.

The goal is dependable work that someone else can understand, verify, and safely continue.
