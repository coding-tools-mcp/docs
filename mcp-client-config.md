# MCP Client Configuration

Use MCP protocol version `2025-06-18`.

## Codex

```toml
[mcp_servers.coding_tools]
command = "uvx"
args = ["coding-tools-mcp", "--stdio", "--workspace", "/path/to/repo"]
```

## Claude Code

```json
{
  "mcpServers": {
    "coding-tools": {
      "command": "uvx",
      "args": ["coding-tools-mcp", "--stdio", "--workspace", "/path/to/repo"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "coding-tools": {
      "command": "uvx",
      "args": ["coding-tools-mcp", "--stdio", "--workspace", "/path/to/repo"]
    }
  }
}
```

## Continue, Cursor, Cline, And Generic HTTP Clients

Configure a Streamable HTTP MCP server at:

```text
http://127.0.0.1:8765/mcp
```

The server is designed for local loopback use. Do not bind it to a public interface without external authentication and sandboxing.

## ChatGPT Remote MCP

For ChatGPT developer-mode testing, keep the server on loopback and expose it through an HTTPS tunnel in anonymous `read-only` mode:

```bash
CODING_TOOLS_MCP_AUTH_MODE=noauth \
CODING_TOOLS_MCP_TOOL_PROFILE=read-only \
scripts/tunnel.sh cloudflared /path/to/repo
```

Configure ChatGPT with:

```text
URL: https://<tunnel-host>/mcp
```

Static bearer-token auth is for generic MCP clients that support custom headers. Authenticated ChatGPT apps require OAuth 2.1, which this server does not implement. See [ChatGPT remote MCP](chatgpt-remote-mcp.md) for details.
