---
name: way-build
description: Apply Santiago's shared engineering conventions when implementing a feature, choosing owned packages, or building a Santiago-branded interface. Preserve the current project's architecture and client branding.
---

Inspect project instructions, manifests, lockfile, current implementation, and worktree state first. Read [working agreements](references/core.md), then the applicable sections of [the full reference](references/global-original.md).

For UI work, read [design guidance](references/design.md) and [package boundaries](references/packages.md). Resolve the installed Lumen framework contracts using its existing tools or exported source. Do not invent components or make a second design system. For architecture work, use [decision guidance](references/architecture.md) and [the shared-source decision](references/0001-shared-sources.md).

Keep local project exceptions scoped. Read only the references relevant to the task. If the Way MCP is available, use search_standards and get_standard to find further guidance with provenance. Packaged references are the offline fallback. Verify changing package versions and APIs against current sources.

Implement the user's requested behavior, validate it with the repository's real gates, and distinguish local checks from remote publication. This skill does not authorize external actions or configuration changes.
