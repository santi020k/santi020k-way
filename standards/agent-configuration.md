# Agent configuration

Maintain shared working agreements once and generate small host-specific entry points. Keep detailed standards available locally and through the read-only catalog.

## Codex

The global entry point is `AGENTS.md` inside the chosen Codex home. The default is `~/.codex`; the installer respects `CODEX_HOME` unless `--home` is provided. Project and nested instructions retain their precedence. The default combined instruction budget is 32 KiB, so full manuals belong in referenced files.

## Claude Code

The global entry point is `CLAUDE.md` inside the chosen Claude configuration directory. The default is `~/.claude`; the installer respects `CLAUDE_CONFIG_DIR` unless `--home` is provided. Host-specific plugin metadata is generated from the same sources as Codex.

## Safe installation

`way setup codex` or `way setup claude` previews a managed instruction block and prints an approval hash without writing. Repeat with `--apply <hash>` to apply that exact preview. Existing content outside the block is preserved. Edited managed blocks, malformed markers, symlink targets, and changed previews are rejected. Each applied change gets a private backup and receipt. `way rollback <agent> --backup <id>` previews restoration; its own approval hash is required to apply.

Versioned reference files live beneath the selected agent home. Installation changes neither runtime configuration nor project instructions. A first install preserves existing global rules; review duplicated or conflicting personal guidance before manually retiring it. The original full global reference is retained in the repository for comparison, not silently substituted for local rules.

## Runtime configuration

Optional examples cover documented configuration keys. Actual model preferences, permissions, trusted directories, local integrations, credentials, session history, and machine paths stay local. Never export the entire agent home or upload it into an MCP catalog. Installing a plugin does not authorize changes to the agent's permission policy.

References:

- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://learn.chatgpt.com/docs/config-file/config-basic
- https://code.claude.com/docs/en/memory
