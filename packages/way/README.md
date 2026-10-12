# @santi020k/way

Versioned design, engineering and architecture guidance for Santiago-owned projects. Includes a
local CLI, a read-only MCP catalog, and preview-based Codex / Claude Code instruction setup.

This is the initial 0.1.0 release candidate. It is usable from a local build; npm publication is a
separate release step. Requires Node 22.22.3 or newer.

```sh
way list
way search "design"
way read design
way mcp
way setup codex
way setup codex --apply <preview-hash>
way setup claude --home /absolute/test-directory
way rollback codex --backup <backup-id>
```

Setup and rollback preview by default. Review the target, content and approval hash before
repeating with `--apply`. Setup preserves text outside its managed section, backs up changed
instructions, rejects symlinks and stale previews, and keeps versioned references beneath the
chosen agent home. Rollback refuses to overwrite later edits. Treat backup receipts as private:
they contain your previous instruction file.

The default homes are `CODEX_HOME` or `~/.codex`, and `CLAUDE_CONFIG_DIR` or `~/.claude`.
`--home` overrides either with an absolute physical directory. On macOS, `/tmp` is a symlink;
use its resolved directory for isolated tests. Model, permissions, trust, credentials and runtime
configuration are never changed by setup. Review overlapping old instructions manually; adding a
managed block does not shorten an existing file or increase the host's instruction budget.

The MCP server exposes `search_standards`, `get_standard`, and `catalog_info`. All reads are from
its bundled catalog: no repository scanning, credentials, network requests or write tools.
Connect with command `way` and arguments `["mcp"]`, or use the host plugin distribution that
bundles this server with three focused skills. Do not register both copies in the same host.

```js
import {
  readCatalog,
  getStandard,
  searchStandards,
} from '@santi020k/way/catalog'

const catalog = readCatalog()
const guidance = getStandard('design', catalog)
const matches = searchStandards('architecture', 5, catalog)
```

Sources carry scope, review dates and content hashes. Package versions and project-specific
contracts must still be verified in the consuming repository.

Website target: [way.santi020k.com](https://way.santi020k.com). Author:
[Santiago Molina](https://santi020k.com).

## License

MIT. See [LICENSE](LICENSE).
