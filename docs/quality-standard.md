# Quality without a mute button

Warnings are unfinished work.

Every project that uses ESLint runs it with `--max-warnings=0`. We do not use `--quiet` in quality
gates because invisible warnings are still debt. Every TypeScript project runs its real type-check
before handoff, and every safe, feasible diagnostic gets fixed at the source.

## The standard

- Root lint commands and direct workspace lint commands fail on one warning.
- `lint-staged` also fails when an autofix leaves warnings behind.
- Agents fix causes instead of lowering severity, widening ignores, or adding suppressions.
- `any`, unsafe casts, non-null assertions, `@ts-ignore`, and `eslint-disable` are not escape hatches.
- A narrow exception is allowed only when the underlying problem cannot be fixed safely. It must
  explain why and leave a tracking path.
- Repositories without an ESLint or TypeScript toolchain do not add one just for uniformity.

TypeScript reports diagnostics rather than a separate warning category. In practice, the rule is
the same: the canonical type-check must finish cleanly.

## The loop

```bash
pnpm run lint:fix
pnpm run lint
pnpm run typecheck
```

Command names vary by project. Read `AGENTS.md` and `package.json`, use the closest existing
equivalents, and finish with the root validation command when the repository provides one.

## Audit every sibling project

From `santi020k-way`:

```bash
pnpm run audit:quality
pnpm run check
```

The audit discovers sibling Git repositories, checks their `AGENTS.md` quality policy, and verifies
that direct ESLint commands do not hide or tolerate warnings.

## Future usage, the santi020k way

Start clean, stay honest, finish green.

When a warning appears, we do not negotiate with it. We understand it, fix the reason it exists,
and leave the code clearer than we found it. Automation keeps the promise, `AGENTS.md` gives future
assistants the context, and the final lint plus type-check proves the work.

No warning confetti. No red TypeScript waiting for “later.” Ship calm code.
