---
name: way-review
description: Review a requested diff, architecture proposal, or repository audit against Santiago's quality, compatibility, design, and security conventions.
---

Read the current diff and project-specific instructions. Use [quality](references/quality.md), [architecture](references/architecture.md), and the applicable sections of [the full reference](references/global-original.md). For visual changes also consult [design](references/design.md) and inspect the rendered result when available.

For tool adoption or configuration changes, consult only the relevant [tool usage section](references/packages.md). Verify that the tool fits the task, uses a supported contract, and runs through the intended consumer workflow. Distinguish installed dependencies and setup previews from successful behavior; respect documented project exceptions.

Report actionable findings with evidence, scope, impact, and a concrete fix. Separate correctness requirements from preferences and accepted project exceptions. Do not invent findings to satisfy a checklist or recommend unrelated migrations. Check real contracts and behavior instead of matching preferred wording.

Give every finding a disposition when reviewing revisions. Treat a passed local check as local evidence only. Review authorization does not authorize edits, external messages, publication, or production changes.
