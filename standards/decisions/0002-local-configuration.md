# Keep machine configuration local

- Status: accepted
- Scope: Agent setup in The santi020k Way
- Owner: Santiago Molina
- Date: 2026-10-12
- Supersedes: none

## Decision

Manage an explicitly delimited global instruction block, install immutable versioned references, and preserve user content around the block. Require a preview hash before changes and retain a private rollback receipt. Detect modifications between preview and apply and reject edited managed content.

Runtime permission settings, model preferences, trust decisions, integrations, credentials, and histories are outside the installer's write scope. Provide optional configuration examples without installing them automatically.

## Consequences

The user can review, update, and roll back guidance independently from their agent's runtime. Existing full global instructions may overlap on first adoption; migrating or deleting them is a separate deliberate edit. Rollback refuses to erase later changes to the target file. Reference snapshots remain available for earlier receipts and are not automatically garbage-collected.
