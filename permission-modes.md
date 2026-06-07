# Permission Modes

`exec_command` has three permission modes.

## safe

Default mode. Commands run with:

- workspace read/write
- system toolchain and DNS resolver paths read-only
- `HOME=.coding-tools/home`
- `TMPDIR=.coding-tools/tmp`
- `.coding-tools/cache` available for user-selected package caches
- network-looking commands blocked
- shell expansion and inline interpreter snippets blocked
- secret-looking and loader/startup env filtered
- Landlock enabled when available

Start explicitly:

```bash
coding-tools-mcp --permission-mode safe --workspace /path/to/repo
```

## trusted

Local development mode. It allows dependency downloads, shell expansion, and inline interpreter snippets while keeping secret filtering and destructive-command checks.

`TMPDIR` points to `/tmp/coding-tools-$SERVER_INSTANCE_ID`, and only that `/tmp` prefix is added as a writable Landlock root.

```bash
coding-tools-mcp --permission-mode trusted --workspace /path/to/repo
```

## dangerous

Dangerous mode disables `exec_command` permission gates and Landlock. Use it only inside an isolated container or VM.

```bash
coding-tools-mcp --permission-mode dangerous --workspace /path/to/repo
```

Compatibility aliases:

- `--allow-network`: opens only the network-looking command gate.
- `--dangerously-skip-all-permissions`: alias for `--permission-mode dangerous`.
