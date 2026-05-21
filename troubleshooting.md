# Troubleshooting

## Protocol Version Errors

HTTP clients should send `MCP-Protocol-Version: 2025-06-18` after initialization. Unsupported versions return a JSON-RPC error.

## SANDBOX_UNAVAILABLE

If `exec_command` returns a warning about Linux Landlock being unavailable, the command still ran under server-side policy checks, but without kernel filesystem confinement. This is expected on Windows, macOS, and Linux hosts without Landlock support. Put the server inside an external sandbox before running untrusted commands or untrusted project code.

If an older client or server reports `SANDBOX_UNAVAILABLE` as an error, upgrade to the current behavior or run on a Landlock-capable Linux kernel.

## Command Hangs Or Times Out

If the result returns `status: "running"`, poll with `write_stdin` using empty `chars`, or terminate with `kill_session`. Session deadlines still apply when the client stops polling.

## Permission Elicitation Is Unsupported

If `request_permissions` returns `ELICITATION_UNSUPPORTED`, the MCP client cannot show approval prompts. For trusted local use, start with `--dangerously-skip-all-permissions` to auto-grant permission-gated operations.

## Trace Tool Calls

For local debugging:

```bash
CODING_TOOLS_MCP_TRACE=1 coding-tools-mcp --workspace /path/to/repo
```

Trace events are JSON lines on stderr. Arguments are redacted for secret-looking keys and values; stdout remains reserved for stdio JSON-RPC frames.

## SWE-bench

If Docker or the `swebench` package is missing, the default scaffold should report `PREFLIGHT_ONLY`; an explicit evaluation attempt should report `BLOCKED`, not pass. See [swe-bench.md](swe-bench.md).
