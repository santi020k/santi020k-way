# v0.2.0 release plan

The user selected **0.2.0** for continued reliability work on 2026-10-12. The local integration
branch is `release/v0.2.0`, based on the fetched `main` commit `d99b14d`. It carries forward the
committed hardening from `82950d0`. The former v0.1.1 preparation was repurposed into the
backup-discovery feature branch without publishing a patch release.
The user authorized the release push, reviewed PR integration, GitHub publication and website
deployment on 2026-10-12. npm publication remains disabled until its publisher is configured.

## Contents

- Explain the architecture with a responsive author/build/use map, clear ownership boundaries,
  decision links and a setup path; verify keyboard use and enlarged-text reflow.
- Add a way-of-working guide, shared through the catalog, CLI, and website, with
  practical examples, a reading map, and implementation versus delivery expectations.
- Parse workflow YAML and require a nonempty version command on every Changesets action; unrelated
  action inputs and commented-out commands no longer produce a false pass.

- Prevent automatic hook installation from claiming an enclosing repository when a source archive
  is extracted inside it. Explicit hook installation now requires the Git worktree root.

- Keep presentation audits focused on source packages by excluding dependencies, generated output,
  caches and fixtures while retaining failures for incomplete source metadata.

- Protect private receipt content in rollback errors and reject special or incorrectly sized reference files before reading them, preventing blocked installers. Share receipt validation with backup discovery and hash current instructions once per listing.

- Remove references to the retired Difftale project from maintained guidance and the sibling inventory.
- Add read-only `way backups <codex|claude>` to discover private receipt IDs, creation times and
  current rollback availability. Listing validates receipts without returning saved instruction text
  and keeps fresh rollback preview and approval mandatory.
- Preserve valid UTF-8 instruction bytes, including BOMs and non-ASCII guidance; refuse invalid
  encoding before setup can replace personal content.
- Validate rollback receipt type, size, hash, timestamp, restored instruction size and permission
  range before restoring a file.
- Validate shared catalog metadata and content integrity during generation and runtime reads.
  Reject unsafe IDs/sources, duplicate identities, missing core guidance and mismatched hashes.
- Reject empty positional arguments on commands that accept none, including the MCP server.
- Start browser tests against a fresh preview on a configurable dedicated port, and verify the
  rendered package version so an unrelated running checkout cannot pass the gate.
- Include prior committed setup, CLI, artifact and publication hardening with its regression tests.

## Compatibility and migration

No CLI commands or package exports are removed. Correctly generated existing receipts remain
usable. Invalid UTF-8 instructions must be repaired manually after backing up their original bytes;
Way does not guess an encoding. Malformed or oversized receipts now fail instead of restoring
unsupported content or permissions. Receipts remain trusted local files, not signed backups.

Catalog hash serialization now follows the shared schema field order. Updating creates a new
immutable reference directory; existing references and receipts are retained. The approval hash
must always come from a fresh preview with the version being installed. No live agent homes or
runtime settings are modified by repository validation.

## Validation and release

Run `pnpm install --frozen-lockfile` and `pnpm verify`, which includes policy, lint, types, tests,
builds, artifact checks, formatting, browser behavior and release packaging. The minor Changeset
was applied for `@santi020k/way`; backup discovery is included in the same 0.2.0 changelog entry.
Generated plugin/site versions derive from that package. Review the full diff against `main` independently before an authorized first push.
Use a release PR into `main`, inspect all review feedback and required checks, then use the
GitHub Release workflow from the merged commit. Do not publish locally.

Production configuration and provider recovery remain documented in the
[v0.1.0 delivery plan](release-v0.1.0.md). Website deployment follows a merge to `main`; local
integration does not authorize that merge or deployment.

## Recovery

Do not move published tags or replace package versions. Fix distribution defects with a new
version and the release workflow. For local setup, preview rollback using the private receipt;
later instruction edits intentionally block restoration. For website regressions, revert through
a reviewed PR and verify deployment smoke checks. Retain old references and backups until the
new installation is accepted. No database or production-data migration is involved.
