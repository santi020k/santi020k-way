# @santi020k/way

## 0.2.0

### Minor Changes

- Remove references to the retired Difftale project from the shared package guidance and repository inventory.

- Add read-only `way backups <codex|claude>` to discover saved rollback IDs, timestamps, and current rollback availability without exposing private instruction content. Listing uses the same strict receipt validation as rollback and preserves later personal edits.

- Harden local instruction setup and rollback with strict UTF-8 preservation and bounded receipt validation. Validate catalog metadata and SHA-256 integrity in builds and runtime reads, and reject empty arguments on no-argument CLI commands. Browser verification now requires a fresh preview server and checks its rendered version.

## 0.1.0

Initial release: a versioned standards catalog, read-only MCP server, and CLI that
previews, installs, updates and rolls back managed Codex or Claude Code instructions. Includes
content provenance, immutable references, stale-preview checks, and preserved personal guidance.
