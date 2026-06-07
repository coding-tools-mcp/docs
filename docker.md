# Docker Sandbox

The Docker image is a deployment shape for a toolchain-ready sandbox. It does not infer project type or run hidden install/build/test logic.

Build locally:

```bash
docker build -t coding-tools-mcp-sandbox:local .
```

Run against the current repository:

```bash
docker run --rm -it \
  -p 8765:8765 \
  -v "$PWD:/workspace" \
  coding-tools-mcp-sandbox:local
```

Because the container binds to `0.0.0.0`, the entrypoint requires HTTP authentication. If you do not set `CODING_TOOLS_MCP_AUTH_TOKEN` or `CODING_TOOLS_MCP_OAUTH_MODE=1`, it generates a bearer token at startup and prints it to stderr.

Container default:

```bash
coding-tools-mcp \
  --workspace /workspace \
  --host 0.0.0.0 \
  --port 8765 \
  --permission-mode trusted
```

Use an explicit token when you need deterministic client configuration:

```bash
docker run --rm -it \
  -p 8765:8765 \
  -e CODING_TOOLS_MCP_AUTH_TOKEN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')" \
  -v "$PWD:/workspace" \
  coding-tools-mcp-sandbox:local
```

Dangerous mode must be explicit:

```bash
docker run --rm -it \
  -p 8765:8765 \
  -e CODING_TOOLS_MCP_PERMISSION_MODE=dangerous \
  -v "$PWD:/workspace" \
  coding-tools-mcp-sandbox:local
```

The entrypoint prints:

```text
WARNING: permission_mode=dangerous disables MCP safety gates.
Use only inside an isolated container or VM.
```

Smoke commands should be explicit `exec_command` calls, for example:

```bash
mvn -version
gcc --version
node --version && npm --version
python --version
go version
cargo --version && rustc --version
```
