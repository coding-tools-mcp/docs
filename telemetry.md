# Telemetry

coding-tools-mcp collects anonymous usage telemetry to answer two product
questions: how many installs are active, and which tools succeed, fail, or run
slowly in the wild. Telemetry is enabled by default and can be disabled at any
time; disabling it changes nothing else about the server.

## How to disable

Any one of the following turns telemetry off completely:

```bash
export CODING_TOOLS_MCP_TELEMETRY=off   # also accepts 0 / false / no
export DO_NOT_TRACK=1                    # the cross-tool convention
```

Telemetry is also disabled automatically whenever `CI` is set, and the test
suite forces it off in `tests/__init__.py`, so CI and test runs never pollute
usage data. Deleting `~/.coding-tools-mcp/id` resets the anonymous install
identity.

To see exactly what would be sent without sending it:

```bash
export CODING_TOOLS_MCP_TELEMETRY=debug  # prints events to stderr instead
```

## What is collected

Events are sent to PostHog (`us.i.posthog.com`) over HTTPS using the standard
library only. The payload is a closed schema — counters, enums, durations, and
version strings assembled by one function (`coding_tools_mcp/telemetry.py`).
It is structurally incapable of carrying paths, arguments, or file contents.

Every event carries: package version, OS platform and architecture, Python
`major.minor`, transport (`stdio`/`http`), permission mode, MCP protocol
version, the connecting client's `clientInfo` name and version (truncated to
64 characters), a random per-session id, and the anonymous install id.

| Event | When | Additional properties |
| --- | --- | --- |
| `session_start` | MCP `initialize` completes | — |
| `tool_error` | a tool call fails (max 20 per session) | tool name, error code, duration ms, consecutive-failure count |
| `tool_summary` | session ends, one per tool used | calls, ok, errors, per-error-code counts, duration buckets, truncation count |
| `session_end` | session ends | session duration, total calls, distinct tools, dropped error-event count |

A typical session produces 5–15 events totalling a few kilobytes.

## What is never collected

File paths, file contents, tool arguments, command lines, environment
variables, patch bodies, diffs, repository or branch names, workspace
locations, hostnames, usernames, and IP-derived identity. The install id is a
random UUID generated locally — never derived from hardware, hostname, or any
workspace property — so it cannot be reversed into an identity.

`tests/test_telemetry.py` enforces the boundary: a probe session touches files
with distinctive path substrings and the test asserts none of them appear
anywhere in the serialized payload, and that a disabled session never reaches
the sender at all.

## Delivery guarantees

Events queue in memory on a bounded queue serviced by a daemon thread with a
3-second send timeout; failures are swallowed and overflow is dropped. Nothing
is written to stdout (over stdio that is the MCP wire), nothing telemetry-
related is stored on disk beyond the install id file, and a dead or slow
telemetry endpoint is invisible to tool calls.
