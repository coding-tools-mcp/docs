import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Coding Tools MCP';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'coding-tools-mcp',
  repo: 'docs',
  branch: 'main',
};

export const coreRepositoryUrl = 'https://github.com/xyTom/coding-tools-mcp';
export const desktopRepositoryUrl = 'https://github.com/coding-tools-mcp/desktop';

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
