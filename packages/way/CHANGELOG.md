# @santi020k/way

## 0.2.0

- Restrict hook installation to the owning Git worktree root, preserving enclosing repositories when using source archives. Keep presentation audits focused on source manifests while ignoring dependencies, generated output, caches, and fixtures.

### Minor Changes

- Clarify the website architecture with a responsive guidance flow, ownership boundaries, decision links, and keyboard and enlarged-text verification.

- Add a way-of-working guide to the shared catalog, with practical code and workflow examples, a reading map, and clear implementation and delivery expectations.
- Require exact version-command keys in release-workflow audits so Node runtime settings and commented commands cannot conceal a missing Changesets version command.

- Keep malformed rollback receipt contents out of error output. Share receipt validation with backup discovery, hash current instructions once per listing, and reject non-regular or incorrectly sized immutable references before reading them.

- Remove references to the retired Difftale project from the shared package guidance and repository inventory.

- Add read-only `way backups <codex|claude>` to discover saved rollback IDs, timestamps, and current rollback availability without exposing private instruction content. Listing uses the same strict receipt validation as rollback and preserves later personal edits.

- Harden local instruction setup and rollback with strict UTF-8 preservation and bounded receipt validation. Validate catalog metadata and SHA-256 integrity in builds and runtime reads, and reject empty arguments on no-argument CLI commands. Browser verification now requires a fresh preview server and checks its rendered version.

## 0.1.0

Initial release: a versioned standards catalog, read-only MCP server, and CLI that
previews, installs, updates and rolls back managed Codex or Claude Code instructions. Includes
content provenance, immutable references, stale-preview checks, and preserved personal guidance.
