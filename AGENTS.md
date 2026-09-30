# Documentation repository guide

This repository owns the public Coding Tools MCP website and human-oriented documentation.

## Boundaries

- Put tutorials, client setup, guides, migrations, and troubleshooting under `content/docs/`.
- Keep runtime contracts, tool schemas, security invariants, benchmark evidence, and CI/release evidence authoritative in `xyTom/coding-tools-mcp`.
- Link to core reference documents instead of copying their contents.
- Keep stable public routes when reorganizing files; use redirects when a published route changes.
- Run `npm run check` for site changes when Node.js dependencies are available.
