import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Coding Tools MCP';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const siteBasePath =
  rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '');

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (siteBasePath
    ? `https://coding-tools-mcp.github.io${siteBasePath}`
    : 'http://localhost:3000');

export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'coding-tools-mcp',
  repo: 'docs',
  branch: 'main',
};

export const coreRepositoryUrl = 'https://github.com/xyTom/coding-tools-mcp';
export const desktopRepositoryUrl = 'https://github.com/coding-tools-mcp/desktop';

export function withBasePath(path: string) {
  if (!path.startsWith('/')) return path;
  if (!siteBasePath || path === siteBasePath || path.startsWith(`${siteBasePath}/`)) {
    return path;
  }
  return `${siteBasePath}${path}`;
}

export function toAbsoluteSiteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const base = siteUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function absolutizeMarkdownLinks(markdown: string) {
  return markdown.replace(
    /\]\((\/[^)]+)\)/g,
    (_match, path: string) => `](${toAbsoluteSiteUrl(path)})`,
  );
}

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: withBasePath(getContentUrl(segments, page.locale)),
  };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    // Next metadata applies basePath itself. Prefixing here would produce
    // /docs/docs/... on GitHub Pages.
    url: getImageUrl(segments, page.locale),
  };
}
