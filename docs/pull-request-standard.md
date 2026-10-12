# Semantic pull request titles

Pull request titles follow Conventional Commits so squash merges produce useful history and release
automation can understand intent.

## The standard

- Use `feat`, `fix`, `docs`, `style`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`, or
  `revert`.
- Start the subject with a lowercase letter.
- Use `!` before the colon for a breaking change, such as `feat!: replace the public API`.
- Add a scope only when it improves meaning, such as `fix(vscode): restore revision navigation`.
- Do not maintain a global scope allowlist. Each repository owns its vocabulary, and an omitted
  scope is valid for repository-wide work.
- Ignore Changesets release pull requests carrying the `autorelease: pending` label.

The workflow uses `pull_request_target` so it can validate titles from forked pull requests. It must
remain metadata-only: never add checkout, cache, build, or execution steps to this workflow.

## Install or update

Copy [`templates/pr-title.yml`](../templates/pr-title.yml) to
`.github/workflows/pr-title.yml` in the target repository.

Run the sibling audit from this repository:

```bash
pnpm run audit:pull-requests
pnpm run check
```

Repositories may opt out when their local `AGENTS.md` documents a stronger constraint. The audit
contains the matching named exception and reason so exclusions stay deliberate and reviewable.
