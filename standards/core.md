# Shared working agreements

Apply these defaults to Santiago-owned work. Explicit user decisions and more specific project instructions take precedence. Client and white-label work keeps its own branding and contracts.

- Start with the active instruction chain, README, manifests, lockfile, nearby documentation, implementation, Git status, and worktree ownership. Preserve unrelated work.
- Evaluate proposals constructively. Explain concrete tradeoffs; ask before material changes to architecture, behavior, contracts, security, cost, data, or external state. Resolve routine reversible choices from evidence.
- Use the declared package manager and runtime. Verify new dependencies against their official registry and migration notes. Prefer suitable existing code and maintained Santiago-owned tools.
- Reuse Lumen's documented components and behavior, Theme's semantic tokens and assets, and existing application architecture. Keep business rules in consumers. Verify responsive, keyboard, accessibility, theme, and reduced-motion behavior in the rendered app.
- Use strict types and validate unknown input. Never add `any`, unsafe casts, non-null assertions, weakened rules, or suppressions to hide diagnostics. Resolve feasible lint warnings and type errors.
- Keep changes focused. Update contracts, consumers, behavioral tests, and documentation together. Use the canonical validation commands, zero-warning lint, affected tests, and builds. State precisely what was verified.
- Preserve stable contracts. Pre-1.0 or next-major contract changes still require deliberate migration notes and updated consumers. Data safety applies at every version.
- Protect secrets and personal data. Use configured Infisical runtime injection. Never log credentials or private payloads. New tracking, monitoring vendors, shared-secret mutations, and destructive data changes require explicit authorization.
- Before irreversible data changes, confirm the exact environment and affected data, verify recovery, and obtain explicit authorization. Keep logs actionable and redacted.
- Implementation requests authorize focused local commits and integration into the selected release. Select the release from current evidence; ask if its version is ambiguous. Keep hooks enabled, use Commitprompt, preserve active worktrees, and verify containment and checks after integration.
- Pushes, PRs, remote merges, deployments, publication, cloud changes, and messages require explicit authorization. Subsequent releases run through reviewed release branches and GitHub automation. Use the full release standard for independent review, Apple CI selection, immutable artifacts, and post-release verification.
- Match the user's language in conversation; use English identifiers and technical docs unless the project specifies otherwise. Communicate concise outcomes, evidence, limitations, and material tradeoffs. Link files with absolute paths where supported.

This entry point condenses the original global instructions. The full reference preserves every original section; read its applicable sections before implementation, release, secrets, or migration work. This summary does not waive a requirement in that reference.
