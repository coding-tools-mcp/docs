import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const outputDir = new URL('../out/', import.meta.url);
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const basePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '');
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (basePath ? `https://coding-tools-mcp.github.io${basePath}` : 'http://localhost:3000')
).replace(/\/$/, '');

async function filesUnder(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const path = new URL(item.name, dir);
    if (item.isDirectory()) files.push(...(await filesUnder(new URL(`${item.name}/`, dir))));
    else files.push(path);
  }
  return files;
}

async function exists(url) {
  try {
    await stat(url);
    return true;
  } catch {
    return false;
  }
}

function localTarget(pathname) {
  if (basePath && !pathname.startsWith(basePath)) {
    return { error: `missing basePath ${basePath}` };
  }

  let path = basePath ? pathname.slice(basePath.length) : pathname;
  path = path.replace(/^\//, '');

  if (!path) return { url: new URL('index.html', outputDir) };
  if (path.startsWith('_next/')) return { url: new URL(path, outputDir) };
  if (path === 'api/search') return { url: new URL('api/search', outputDir) };
  if (extname(path)) return { url: new URL(path, outputDir) };
  return { url: new URL(`${path.replace(/\/$/, '')}/index.html`, outputDir) };
}

const htmlFiles = (await filesUnder(outputDir)).filter((url) => url.pathname.endsWith('.html'));
const broken = [];
let checked = 0;

for (const htmlUrl of htmlFiles) {
  const html = await readFile(htmlUrl, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (
      /^(?:https?:|mailto:|javascript:|data:|#)/.test(raw) ||
      (!raw.includes('/') && !raw.startsWith('/'))
    ) {
      continue;
    }

    const pathname = raw.split(/[?#]/, 1)[0];
    if (!pathname.startsWith('/')) continue;

    const target = localTarget(pathname);
    checked += 1;
    if (target.error || !(await exists(target.url))) {
      broken.push({
        page: relative(outputDir.pathname, htmlUrl.pathname),
        url: raw,
        target: target.error ?? relative(outputDir.pathname, target.url.pathname),
      });
    }
  }
}

const quickstart = await readFile(new URL('getting-started/index.html', outputDir), 'utf8');
const expectedOg = `${siteUrl}/og/docs/getting-started/image.png`;
const ogImage = quickstart.match(/<meta property="og:image" content="([^"]+)"/)?.[1];

const search = JSON.parse(await readFile(new URL('api/search', outputDir), 'utf8'));
const searchDocuments = search.internalDocumentIDStore?.internalIdToId?.length ?? 0;

const llms = await readFile(new URL('llms.txt', outputDir), 'utf8');
const expectedQuickstart = `${siteUrl}/getting-started`;
const pageMarkdown = await readFile(
  new URL('llms.mdx/docs/getting-started/content.md', outputDir),
  'utf8',
);

if (broken.length > 0) {
  console.error('Broken static references:');
  for (const item of broken.slice(0, 50)) console.error(item);
  process.exitCode = 1;
}
if (ogImage !== expectedOg) {
  console.error(`Unexpected og:image: ${ogImage ?? 'missing'}; expected ${expectedOg}`);
  process.exitCode = 1;
}
if (searchDocuments === 0) {
  console.error('Static search index is empty.');
  process.exitCode = 1;
}
if (!llms.includes(expectedQuickstart) || !pageMarkdown.includes(expectedQuickstart)) {
  console.error('LLM outputs do not contain the public absolute quickstart URL.');
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(
    `Static export OK: ${htmlFiles.length} HTML files, ${checked} local references, ${searchDocuments} search records.`,
  );
}
