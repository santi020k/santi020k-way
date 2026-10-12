# Share sources; adapt delivery

- Status: accepted
- Scope: The santi020k Way
- Owner: Santiago Molina
- Date: 2026-10-12
- Supersedes: none

## Context

Brand, library contracts, and engineering guidance live in several maintained repositories. Rewriting them separately for each agent would cause drift.

## Decision

Use a pnpm Turborepo with a shared CLI/catalog package, a generated plugin package, and an Astro documentation site. Keep standards in versioned Markdown with explicit source metadata. Generate Codex and Claude instructions, plugin references, and site content from that same catalog. Keep the full imported global instructions as a traceable reference and the always-loaded core concise.

## Alternatives and consequences

A single large global instruction file is easy to copy but consumes context and cannot distinguish task-specific guidance. Separate handwritten host manuals drift. A hosted search service adds operations and privacy boundaries before they are needed. Versioned local catalog snapshots work offline and can be inspected and reproduced; updates require a new package version. The MCP exposes search and retrieval only. Installation is a separate explicit local CLI operation.

Theme continues to own tokens and brand assets. Lumen continues to own component contracts. The Way catalog provides scoped summaries and links to those sources; current repository evidence wins over outdated snapshots.
