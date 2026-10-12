---
name: enforce-quality-gates
description: Enforce zero-debt ESLint and TypeScript quality gates in JavaScript or TypeScript repositories. Use when adding or repairing lint scripts, resolving ESLint warnings, fixing TypeScript diagnostics, reviewing suppressions, preparing a handoff, or standardizing AGENTS.md quality instructions across a repository or monorepo.
---

# Enforce Quality Gates

Keep the repository at zero feasible ESLint warnings and TypeScript diagnostics. Treat warnings as
work, not as successful output.

## Workflow

1. Read the nearest `AGENTS.md` and the root `package.json`.
2. Inspect the worktree before editing. Preserve unrelated user changes.
3. Find the repository's canonical lint and type-check commands. Prefer root orchestration commands
   over inventing new ones.
4. Ensure every direct ESLint command used by `lint*`, `format:js`, or `lint-staged` includes
   `--max-warnings=0`. Remove `--quiet` because it hides warning debt.
5. Run autofix when available, inspect the diff, then fix the remaining causes manually.
6. Fix TypeScript diagnostics at their source. Prefer better types, control flow, and APIs over
   assertions or suppressions.
7. Rerun lint and the repository's type-check command until both pass.
8. Report the exact commands run. If an external or unrelated blocker remains, report its file and
   diagnostic; never hide it to make the gate green.

## Guardrails

- Do not lower rule severity, disable a rule, exclude files, or add `eslint-disable` just to pass.
- Do not introduce `any`, `@ts-ignore`, `@ts-expect-error`, unsafe casts, or non-null assertions as
  shortcuts.
- Use a narrowly scoped suppression only when the underlying issue cannot be fixed safely. Document
  the reason and keep a tracking path.
- Do not add ESLint or TypeScript to a repository that does not use that toolchain solely to satisfy
  this standard.
- When existing diagnostics are broader than the requested change, fix every safe and feasible one.
  Never finish while a feasible warning or diagnostic remains.

## Audit

Run the bundled audit against a repository:

```bash
node .agents/skills/enforce-quality-gates/scripts/audit-eslint-commands.mjs .
```

The audit checks direct ESLint commands in package scripts and `lint-staged`. It rejects hidden
warnings and commands without a zero-warning budget.
