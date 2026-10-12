---
name: way-build
description: Apply Santiago's shared engineering conventions when implementing a feature, choosing owned packages, or building a Santiago-branded interface. Preserve the current project's architecture and client branding.
---

Inspect project instructions, manifests, lockfile, current implementation, and worktree state first. Read [working agreements](references/core.md), then the applicable sections of [the full reference](references/global-original.md).

When choosing or integrating a tool, read the relevant section of [package boundaries and usage](references/packages.md): Lumen and Theme for UI, ESLint Config Basic and Quality for checks, Astro Doctor for Astro diagnostics, Commitprompt for commits, Dep Beacon for dependency work, OG for social images, and Auth for authentication. Inspect current configuration and compatibility first; adopt only what serves the requested task. Follow the section's verification steps in the consumer and record material exceptions in its nearest documentation.

For UI work, also read [design guidance](references/design.md). Resolve the installed Lumen framework contracts using its existing tools or exported source. Do not invent components or make a second design system. For architecture work, use [decision guidance](references/architecture.md) and [the shared-source decision](references/0001-shared-sources.md).

Keep local project exceptions scoped. Read only the references relevant to the task. If the Way MCP is available, use search_standards and get_standard to find further guidance with provenance. Packaged references are the offline fallback. Verify changing package versions and APIs against current sources.

Implement the user's requested behavior, validate it with the repository's real gates, and distinguish local checks from remote publication. This skill does not authorize external actions or configuration changes.
