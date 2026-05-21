# ChatGPT Remote MCP

This guide exposes `coding-tools-mcp` to ChatGPT developer-mode connectors and other remote MCP clients through an HTTPS tunnel.

ChatGPT Apps SDK developer connectors do not use arbitrary static bearer headers. For authenticated ChatGPT apps, OpenAI expects OAuth 2.1 discovery and authorization. OAuth is intentionally out of scope for this server today, so ChatGPT developer-mode testing should use anonymous `read-only` mode only. Static bearer-token auth remains available for generic MCP clients that support custom `Authorization` headers.

## Profile Choice

Use `--tool-profile read-only` first. It exposes inspection and git read tools plus `set_default_cwd` for navigation, and omits workspace mutation tools such as `apply_patch`, `exec_command`, `write_stdin`, and `kill_session`.

Use `--tool-profile full` only for trusted generic MCP clients that support write tools and truthful annotations. Avoid `full` and `compat-readonly-all` for anonymous ChatGPT tunnel testing.

## ChatGPT Developer Mode

```bash
CODING_TOOLS_MCP_AUTH_MODE=noauth \
CODING_TOOLS_MCP_TOOL_PROFILE=read-only \
scripts/tunnel.sh cloudflared /path/to/repo
```

Configure the ChatGPT connector with the HTTPS tunnel URL:

```text
https://<tunnel-host>/mcp
```

ChatGPT may show `Supported authorization methods: none`. That is expected for this development mode.

## Generic MCP Clients With Bearer Auth

For clients that can send custom headers:

```bash
export CODING_TOOLS_MCP_AUTH_TOKEN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"

CODING_TOOLS_MCP_AUTH_MODE=bearer \
CODING_TOOLS_MCP_TOOL_PROFILE=read-only \
scripts/tunnel.sh cloudflared /path/to/repo
```

Use:

```text
URL: https://<tunnel-host>/mcp
Header: Authorization: Bearer <token>
```

## Tunnel Scripts

Each script starts `coding-tools-mcp` on `127.0.0.1` and then starts the selected tunnel provider. If the provider CLI is missing, the script asks before installing it.

```bash
scripts/tunnel.sh cloudflared /path/to/repo
scripts/tunnel.sh ngrok /path/to/repo
scripts/tunnel.sh devtunnel /path/to/repo
```

Optional environment variables:

```bash
CODING_TOOLS_MCP_AUTO_INSTALL_TUNNEL=1
CODING_TOOLS_MCP_AUTH_MODE=bearer
CODING_TOOLS_MCP_PORT=8765
CODING_TOOLS_MCP_TOOL_PROFILE=read-only
CODING_TOOLS_MCP_AUTH_TOKEN=<existing-token>
CODING_TOOLS_MCP_SERVER_BIN=coding-tools-mcp
```

If the selected tunnel CLI is missing, the scripts prompt before installing it. `cloudflared` installs into `~/.local/bin` when Homebrew is unavailable; `ngrok` uses Homebrew or npm; `devtunnel` uses the Microsoft installer script.

## Local Checks

Replace `BASE_URL` with the tunnel origin, without `/mcp`.

```bash
curl "$BASE_URL/.well-known/mcp.json"
```

For bearer mode only:

```bash
curl "$BASE_URL/mcp" \
  -H "Authorization: Bearer $CODING_TOOLS_MCP_AUTH_TOKEN"

curl "$BASE_URL/mcp" \
  -H "Authorization: Bearer $CODING_TOOLS_MCP_AUTH_TOKEN" \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  --data '{"jsonrpc":"2.0","id":1,"method":"ping","params":{}}'
```

Missing or wrong bearer tokens on `/mcp` should return HTTP `401`.

## Security Notes

Keep the server bound to `127.0.0.1` and expose only the tunnel URL. Non-loopback binding without a bearer token is rejected. Use HTTPS tunnel URLs, rotate tokens if they are shared, and do not use `full` or `compat-readonly-all` with untrusted clients.

Anonymous ChatGPT developer-mode testing exposes whatever the selected profile permits to anyone who can reach the tunnel URL. Use `read-only`, avoid sensitive workspaces, and stop the tunnel when testing is done.
