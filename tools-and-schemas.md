# Tools And Schemas

The normative schema source is [profile-v0.1.md](profile-v0.1.md). Live schemas are returned by `tools/list` and compared against the profile by `make test-schema-drift`.

## Tool Inventory

- `read_file`: read UTF-8 text slices inside the workspace.
- `server_info`: inspect server/version/protocol/workspace/default cwd/profile/auth metadata.
- `get_default_cwd`: return the current default cwd inside the workspace.
- `set_default_cwd`: set the default cwd for relative tool paths.
- `list_dir`: list directory entries under the workspace.
- `list_files`: glob workspace files.
- `search_text`: search text or regex matches.
- `apply_patch`: apply a patch envelope.
- `exec_command`: run a bounded command under policy, with Landlock confinement when available.
- `write_stdin`: write to a live server-managed command session.
- `kill_session`: terminate a server-managed command session.
- `git_status`: inspect git status.
- `git_diff`: inspect unified diff.
- `git_log`: inspect recent commits.
- `git_show`: inspect bounded `git show` output for a revision.
- `git_blame`: inspect bounded blame metadata for a file.
- `request_permissions`: return structured permission-request status.
- `view_image`: return a workspace image as MCP image content.

Every tool returns `content`, `structuredContent`, and `isError`. Tool execution failures use `isError: true` with structured error details.

## Tool Profiles

- `full`: exposes all tools with truthful annotations.
- `read-only`: exposes inspection-oriented tools and omits local mutation tools.
- `compat-readonly-all`: exposes all tools but advertises them as read-only for compatibility. This does not change behavior; mutation-capable tools can still mutate local state.
