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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
