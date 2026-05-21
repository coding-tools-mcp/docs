# Quickstart

Run the runtime directly with `uvx` against the current directory:

```bash
uvx coding-tools-mcp --workspace .
```

Use stdio for MCP clients:

```bash
uvx coding-tools-mcp --stdio --workspace /path/to/repo
```

When working from this checkout instead of a published package, install the runtime in editable mode:

```bash
python -m pip install -e ".[dev]"
```

Start Streamable HTTP against a workspace:

```bash
coding-tools-mcp --workspace /path/to/repo --host 127.0.0.1 --port 8765
```

Endpoint:

```text
http://127.0.0.1:8765/mcp
```

Start stdio:

```bash
coding-tools-mcp --stdio --workspace /path/to/repo
```

Run the acceptance gate:

```bash
make compliance
```

For local trace debugging:

```bash
CODING_TOOLS_MCP_TRACE=1 coding-tools-mcp --workspace /path/to/repo
```

Trace JSON lines are written to stderr.

If the MCP client cannot show permission prompts and you intentionally want permission-gated commands to run:

```bash
coding-tools-mcp --dangerously-skip-all-permissions --workspace /path/to/repo
```

Use this only with trusted workspaces and trusted clients. It does not remove workspace path boundaries.
