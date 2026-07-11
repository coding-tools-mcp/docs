# MCP Client Configuration

Use MCP protocol version `2025-11-25`. Version `2025-06-18` remains supported
for existing clients.

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

## Remote MCP

For remote MCP clients, keep the server on loopback and expose it through an
HTTPS tunnel with authentication. The fixed tool set includes mutation and
command execution:

```bash
CODING_TOOLS_MCP_AUTH_MODE=bearer \
scripts/tunnel.sh cloudflared /path/to/repo
```

Configure the remote MCP client with:

```text
URL: https://<tunnel-host>/mcp
```

Static bearer-token auth is available for clients that support custom
`Authorization` headers. OAuth-aware MCP clients can use `--oauth-mode`, which
publishes protected-resource and authorization-server discovery plus RFC 7591
dynamic registration and a PKCE authorization flow. Clients that support
neither require an external authenticated proxy. See [Remote MCP](remote-mcp.md).
