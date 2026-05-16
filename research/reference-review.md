# Reference Review Notes

## Non-Codex Competitor Notes: 2026-05-16

- OpenCode: useful low-level tool split (`read`, `list`, `glob`, `grep`, `edit`, `write`, `apply_patch`, `bash`, experimental `lsp`) and permission groups. Its default-all-tools-enabled posture is too permissive for this project.
- Claude Code: strongest subagent and permission model. Borrow scoped tools, scoped MCP servers, worktree isolation, and hook-style pre/post checks as internal design patterns. Do not copy product-level auto/bypass permission modes.
- Gemini CLI: good references for rootDirectory file tools, confirmation diffs, checkpointing, command restrictions, MCP include/exclude/trust config, and Docker/Podman/seatbelt sandboxing. Avoid nondeterministic model-assisted edit repair in the runtime contract.
- Aider: repo map, strict edit formats, `/diff`, `/undo`, `/test`, and git-centered review loops are valuable. Auto-committing every edit is unsuitable in a shared multi-agent worktree.
- SWE-agent and mini-SWE-agent: borrow the ACI discipline, output caps, Docker/Singularity benchmark environments, and final patch validation. A bash-only interface is too broad for the P0 MCP runtime.
- MCP Inspector/spec: use Inspector CLI for contract tests; use tool annotations as descriptive risk hints only, with server-side enforcement for actual safety.

## OpenAI Codex Internals Notes: 2026-05-16

- OpenAI Codex's public MCP server exposes high-level `codex` and `codex-reply` tools; use it as a transport reference, not as this runtime's tool surface.
- Reuse the Codex `apply_patch` grammar and scenario coverage, but add stricter workspace, symlink, and atomic/partial-result policy.
- Use unified `exec_command`/`write_stdin` semantics as the baseline for sessions, polling, output caps, and TTY-gated stdin; add explicit `kill_session`.
- Keep product-layer Codex features out of the runtime MCP server: account/login, model routing, cloud tasks, memory, web search, image generation, plugin install, planning, and subagent orchestration.
