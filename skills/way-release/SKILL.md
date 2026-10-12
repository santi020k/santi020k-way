---
name: way-release
description: Prepare or assess a requested release for a Santiago-owned package, application, or website using its actual release family and authorization boundaries.
---

Read [release engineering](references/release.md) and the release, Git, data safety, secret, and review sections in [the full reference](references/global-original.md). Inspect the repository release plan, refs, worktrees, manifests, current checks, and latest review feedback.

Resolve the exact version and release base before branching. Preserve unrelated work and hooks. Use a fresh independent review before the first release push when delegation is available; disposition findings before continuing. Package, native Apple, and website deployments have different validation and delivery boundaries. Verify repository visibility before choosing the prescribed Apple CI provider.

Prepare focused commits, migration notes, and recovery guidance, then validate and integrate locally into the selected release. Pushes, PRs, remote merges, deployment, and publication require explicit authorization. If authorized, follow the documented automated release route and verify the final artifact and deployed behavior. Never equate a green build with a completed release. Report concrete blockers without bypassing gates.
