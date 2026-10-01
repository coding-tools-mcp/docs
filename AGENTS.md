# Documentation repository guide

This repository owns the public Coding Tools MCP website and human-oriented documentation.

## Boundaries

- Put tutorials, client setup, guides, migrations, troubleshooting, and ecosystem documentation under `content/docs/`.
- English is the default language and keeps prefix-free public routes. Simplified Chinese uses `/zh-CN/`.
- Every user-facing English `.mdx` page must have a matching `.zh-CN.mdx` translation. Every `meta.json` used for navigation must have a matching `meta.zh-CN.json`.
- Keep English and Simplified Chinese examples, commands, versions, warnings, and links semantically aligned when editing either language.
- Keep runtime contracts, tool schemas, security invariants, benchmark evidence, and CI/release evidence authoritative in `xyTom/coding-tools-mcp`.
- Link to core reference documents instead of copying their contents.
- Keep stable public routes when reorganizing files; use redirects when a published route changes.
- The Ecosystem page must clearly distinguish official projects from community-maintained projects.
- Only list community projects that have a public, verifiable source. Describe them from their own public documentation, avoid implying endorsement, and keep the non-official support/security disclaimer intact.
- When adding a derivative project, verify that its public repository clearly describes its relationship to Coding Tools MCP and preserves the relevant upstream license/attribution obligations.
- Run `npm run check` for site changes when Node.js dependencies are available. The static export gate enforces bilingual content parity, GitHub Pages links, locale-specific search, metadata, and LLM outputs.
