# Coding Tools MCP Docs

The documentation website for [Coding Tools MCP](https://github.com/xyTom/coding-tools-mcp), built with Next.js and Fumadocs.

Published site: https://coding-tools-mcp.github.io/docs/

## Development

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Run the full local validation with:

```bash
npm run check
```

Preview the static export after a build:

```bash
npm run build
python3 -m http.server 3000 -d out
```

## GitHub Pages

The site is a pure Next.js static export and deploys from `main` with GitHub Actions.
In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The workflow reads GitHub Pages' reported base path at build time, so the default
project URL (`https://coding-tools-mcp.github.io/docs/`) works without hardcoding
`/docs`. A future custom domain also works without changing the application routes.

The generated site is uploaded from `out/`; no Next.js server is required.

## Documentation ownership

This repository owns user-facing tutorials, setup guides, migration guides, and troubleshooting content.

Runtime contracts, tool schemas, security invariants, CI evidence, and benchmark evidence remain authoritative in the core repository. Link to those sources instead of copying them here.

## Repositories

- Core runtime: https://github.com/xyTom/coding-tools-mcp
- Desktop app: https://github.com/coding-tools-mcp/desktop
- Documentation: https://github.com/coding-tools-mcp/docs

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
