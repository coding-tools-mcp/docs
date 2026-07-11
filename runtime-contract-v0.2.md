# Coding Tools MCP Runtime Contract v0.2

Status: implemented contract for `coding-tools-mcp` 0.2.x.

Protocol target: MCP `2025-11-25`, with explicit compatibility for `2025-06-18`.

This contract describes one stable, model-neutral coding tool set. There are no
tool profiles and the server does not add or remove process tools dynamically.
`apply_patch` is the only direct file-mutation primitive; `edit_file` is not
provided. Permission modes alter command policy, not the advertised catalog.

## Protocol and transports

- Streamable HTTP uses `POST /mcp`. `DELETE /mcp` terminates the selected
  `Mcp-Session-Id`. Because this server does not provide an SSE stream,
  `GET /mcp` and `HEAD /mcp` return `405`.
- Each successful HTTP `initialize` creates an independent runtime. Its cwd,
  process sessions, retained output, and runtime directories are not shared
  with other MCP sessions.
- Subsequent HTTP messages must include the returned `Mcp-Session-Id` and the
  negotiated `MCP-Protocol-Version`. Unknown or expired sessions return `404`.
- JSON-RPC batches are rejected. Cancellation uses
  `notifications/cancelled.params.requestId`.
- stdio is newline-delimited JSON-RPC. stdout contains protocol messages only;
  diagnostics and logs go to stderr.
- The only advertised server capability is stable tools with
  `listChanged: false`. Logging, resources, prompts, sampling, and elicitation
  are not advertised.

The server accepts only the protocol versions listed above. A supported version
is echoed in `initialize`; arbitrary older dates and unknown future dates are
rejected rather than compared lexicographically.

## Automatic project context

Initialization automatically loads bounded root project instructions from
`AGENTS.md`, `AGENTS.MD`, `CLAUDE.md`, and `CLAUDE.MD` when present. The content
is included in the MCP `instructions` field, so an agent does not need an
`open_workspace` call. Nested instruction files are indexed by path but are not
eagerly injected. Loading is UTF-8 safe and bounded by file-count, scan-count,
depth, per-file, and total-byte limits.

## Workspace and patch guarantees

- One server runtime owns one canonical workspace root.
- Direct path inputs are workspace-relative. Absolute paths, `..` traversal,
  NUL bytes, and symlink escapes are rejected.
- `apply_patch` parses and validates every operation before committing.
- Every replacement is prepared and fsynced in the target directory, then
  installed with `os.replace`.
- Existing mode bits, UTF-8 BOMs, and CRLF/LF style are preserved. Moves inherit
  the source mode.
- Baseline hashes and modes are checked before commit and again immediately
  before replacement. Conflicts are retryable and never silently overwrite a
  newly-created target.
- A failed multi-file commit restores all backups. Portable filesystems do not
  offer a true transaction across directories, so a rollback failure is
  reported explicitly as `PATCH_ROLLBACK_FAILED` with recovery details.

## Result contract

Every valid `tools/call` response contains:

```json
{
  "content": [{"type": "text", "text": "Short agent-readable result"}],
  "structuredContent": {"ok": true},
  "isError": false
}
```

`content` is concise model-facing text and is never a JSON serialization of the
whole payload. Model-facing previews are bounded. `structuredContent` is the
complete, stable machine-readable interface. Large diffs and command output are
not copied into `_meta`; `_meta` is optional UI extension space only.

Tool failures keep the same envelope with `isError: true`, a readable error in
`content`, and this machine shape:

```json
{
  "ok": false,
  "error": {
    "code": "PATCH_CONTEXT_AMBIGUOUS",
    "message": "Patch context matched more than one location.",
    "category": "validation",
    "retryable": true,
    "details": {"path": "src/app.py", "hunk_index": 0, "match_count": 2}
  }
}
```

Known tool error codes include:

```json
["ABSOLUTE_PATH_DENIED", "BINARY_FILE", "ELICITATION_UNSUPPORTED", "GIT_ERROR", "INTERNAL_ERROR", "INVALID_ARGUMENT", "IS_DIRECTORY", "NOT_A_DIRECTORY", "NOT_FOUND", "OUTPUT_TOO_LARGE", "PATCH_CONFLICT", "PATCH_CONTEXT_AMBIGUOUS", "PATCH_CONTEXT_NOT_FOUND", "PATCH_FAILED", "PATCH_HUNKS_OVERLAP", "PATCH_ROLLBACK_FAILED", "PATH_OUTSIDE_WORKSPACE", "PERMISSION_REQUIRED", "RUNTIME_DIR_UNWRITABLE", "SANDBOX_UNAVAILABLE", "SESSION_CLOSED", "SESSION_LIMIT_REACHED", "SESSION_NOT_FOUND", "SYMLINK_ESCAPE", "TTY_UNSUPPORTED", "UNSUPPORTED_ENCODING"]
```

Error categories are `validation`, `security`, `permission`, `runtime`,
`not_found`, `conflict`, and `internal`.

Malformed JSON-RPC uses standard protocol errors: parse `-32700`, invalid
request `-32600`, unknown method `-32601`, invalid params/tool `-32602`, and
unexpected server failure `-32603`.

## Process lifecycle

`exec_command`, `write_stdin`, `read_output`, and `kill_session` are always in
the catalog. `exec_command` and `write_stdin` default to a 10-second yield. A
short command normally finishes in one call. A running command returns:

```json
{
  "status": "running",
  "session_id": "...",
  "next_action": {
    "tool": "write_stdin",
    "arguments": {"session_id": "...", "chars": "", "yield_time_ms": 10000}
  }
}
```

Call `write_stdin` with empty `chars` to poll. `read_output` is needed only when
output is truncated or a caller explicitly requested compact retained output.
Its offsets are absolute and independent for stdout and stderr.

Active processes, completed-output sessions, per-session bytes, and total
runtime bytes are bounded. Completed sessions have a TTL. POSIX `tty=true` uses
a real pseudo-terminal; Windows reports `TTY_UNSUPPORTED` in this build instead
of pretending pipes are a TTY.

## HTTP authentication

Non-loopback deployment requires bearer or OAuth authentication unless the
operator explicitly selects no-auth. OAuth implements Authorization Code +
PKCE S256, protected-resource metadata, authorization-server metadata, exact
redirect URI matching, one-time five-minute codes, one-hour access tokens, and
RFC 7591 dynamic client registration at `POST /oauth/register`. Public and
confidential clients are bound to their registered authentication method.

Dynamic registrations and authorization codes are process-local; restarting
the server requires clients to register again. Configure a stable
`CODING_TOOLS_MCP_OAUTH_TOKEN_SECRET` and public server URL only when tokens must
survive tunnel churn. Forwarded headers are ignored unless
`CODING_TOOLS_MCP_TRUST_PROXY_HEADERS=1` is explicitly set.

## Stable tool inventory

The default catalog has 20 tools, including `view_image`. Setting
`CODING_TOOLS_MCP_ENABLE_VIEW_IMAGE=0` is the sole installation capability gate
and removes only that optional binary-content tool. It is not a tool profile.

Each definition below lists the live input property names and annotations. The
authoritative JSON Schemas are returned by `tools/list` and checked for drift in
CI.

### server_info

Inputs: none.

Annotations: `{"title":"Server info","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Returns server version, protocol, workspace, cwd, fixed tool count, auth state,
permission mode, runtime directories, project-context metadata, and exec policy.

### check_exec_environment

Inputs: none.

Annotations: `{"title":"Check exec environment","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Returns lightweight policy and Landlock status without running active probes.

### get_default_cwd

Inputs: none.

Annotations: `{"title":"Get default cwd","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### set_default_cwd

Inputs: `"path"`.

Annotations: `{"title":"Set default cwd","readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Changes only this MCP runtime's navigation base; it does not modify files.

### read_file

Inputs: `"path"`, `"start_line"`, `"end_line"`, `"max_lines"`, `"max_bytes"`, `"encoding"`.

Annotations: `{"title":"Read file","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Reads UTF-8 ranges as a stream, reports full file line/byte metadata, rejects
binary content, and returns continuation metadata when bounded.

### list_dir

Inputs: `"path"`, `"recursive"`, `"max_depth"`, `"max_entries"`, `"include_hidden"`, `"include_ignored"`, `"sort"`.

Annotations: `{"title":"List directory","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### list_files

Inputs: `"path"`, `"patterns"`, `"glob"`, `"exclude_patterns"`, `"include_hidden"`, `"include_ignored"`, `"max_results"`, `"sort"`.

Annotations: `{"title":"List files","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Traversal is iterative and git-ignore checks are batched.

### search_text

Inputs: `"query"`, `"path"`, `"regex"`, `"case_sensitive"`, `"include_globs"`, `"glob"`, `"exclude_globs"`, `"context_lines"`, `"max_results"`, `"max_preview_bytes"`.

Annotations: `{"title":"Search text","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

Ripgrep output is consumed incrementally and the process stops once the result
cap is known to be exceeded. `context_lines=0` does not reread matching files.

### apply_patch

Inputs: `"patch"`, `"dry_run"`.

Annotations: `{"title":"Apply patch","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":false}`.

Supports `*** Add File`, `*** Update File`, `*** Delete File`, and
`*** Move to` inside a `*** Begin Patch` / `*** End Patch` envelope.

### exec_command

Inputs: `"cmd"`, `"workdir"`, `"cwd"`, `"timeout_ms"`, `"yield_time_ms"`, `"max_output_bytes"`, `"verbosity"`, `"preview_bytes"`, `"stdin"`, `"tty"`, `"env"`.

Annotations: `{"title":"Execute command","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":true}`.

Statuses are `exited`, `running`, `timeout`, `terminated`, or `failed`.
Launch/policy failures use the error envelope with `status: "failed"`; signal
exits use `terminated`. Ordinary non-zero exit codes still use `exited`.

### write_stdin

Inputs: `"session_id"`, `"chars"`, `"yield_time_ms"`, `"max_output_bytes"`, `"verbosity"`, `"preview_bytes"`.

Annotations: `{"title":"Write stdin","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":false}`.

Poll or interact with a command session. Pass empty `chars` to wait for output.

### kill_session

Inputs: `"session_id"`, `"signal"`, `"wait_ms"`, `"max_output_bytes"`, `"verbosity"`, `"preview_bytes"`.

Annotations: `{"title":"Kill session","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":false}`.

Statuses are `["terminated", "killed", "exited", "terminating", "not_found"]`.

### read_output

Inputs: `"output_ref"`, `"stream"`, `"offset"`, `"limit"`.

Annotations: `{"title":"Read output","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### git_status

Inputs: `"path"`, `"include_untracked"`, `"max_entries"`.

Annotations: `{"title":"Git status","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### git_diff

Inputs: `"path"`, `"paths"`, `"staged"`, `"unstaged"`, `"context_lines"`, `"max_bytes"`.

Annotations: `{"title":"Git diff","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### git_log

Inputs: `"path"`, `"ref"`, `"max_count"`, `"skip"`.

Annotations: `{"title":"Git log","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### git_show

Inputs: `"rev"`, `"path"`, `"paths"`, `"include_diff"`, `"context_lines"`, `"max_bytes"`.

Annotations: `{"title":"Git show","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### git_blame

Inputs: `"path"`, `"rev"`, `"start_line"`, `"end_line"`, `"max_lines"`.

Annotations: `{"title":"Git blame","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

### request_permissions

Inputs: `"tool_name"`, `"permission"`, `"reason"`, `"arguments"`, `"scope"`, `"ttl_seconds"`.

Annotations: `{"title":"Request permissions","readOnlyHint":true,"destructiveHint":false,"idempotentHint":false,"openWorldHint":false}`.

The current server does not advertise MCP elicitation. This tool therefore
returns `ELICITATION_UNSUPPORTED`, except that dangerous mode reports the
operator's explicit auto-grant policy. It never silently escalates safe mode.

### view_image

Inputs: `"path"`, `"max_bytes"`, `"max_width"`, `"max_height"`, `"auto_resize"`.

Annotations: `{"title":"View image","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`.

The base64 data appears exactly once, in one MCP image content block. Stable
`structuredContent` contains metadata only; it has no duplicate base64 or data
URL. Pillow is optional and used only for requested auto-resize.

## Forbidden product-layer tools

The runtime does not expose external-agent login/accounts, agent memory, cloud
tasks, web search/fetch, image generation, model routing, plugin installation,
subagent orchestration, or high-level prompt wrappers.

## Compatibility note for 0.2

0.1 clients that parsed the text block as JSON must switch to
`structuredContent`. The machine fields are retained where practical, while the
text block is now a concise human/model summary. Removed compatibility surfaces
are tool profiles, the `view_image.output` selector, duplicate image data URLs,
and JSON-RPC batches.
