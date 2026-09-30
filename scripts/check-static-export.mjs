import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, relative } from 'node:path';

const outputDir = new URL('../out/', import.meta.url);
const contentDir = new URL('../content/docs/', import.meta.url);
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

function readLang(html) {
  return html.match(/<html[^>]*lang="([^"]+)"/)?.[1];
}

function readOgImage(html) {
  return html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
}

function contentRelative(url) {
  return decodeURIComponent(relative(contentDir.pathname, url.pathname));
}

function slugFromEnglishPage(path) {
  const withoutExtension = path.replace(/\.mdx$/, '');
  return withoutExtension === 'index'
    ? ''
    : withoutExtension.replace(/\/index$/, '');
}

const htmlFiles = (await filesUnder(outputDir)).filter((url) => url.pathname.endsWith('.html'));
const contentFiles = await filesUnder(contentDir);
const englishPages = contentFiles.filter(
  (url) => url.pathname.endsWith('.mdx') && !url.pathname.endsWith('.zh-CN.mdx'),
);
const englishMeta = contentFiles.filter((url) => url.pathname.endsWith('/meta.json'));

const broken = [];
let checked = 0;

for (const page of englishPages) {
  const path = contentRelative(page);
  const translated = new URL(path.replace(/\.mdx$/, '.zh-CN.mdx'), contentDir);
  if (!(await exists(translated))) {
    broken.push({
      page: path,
      url: contentRelative(translated),
      target: 'missing Simplified Chinese translation',
    });
  }
}

for (const meta of englishMeta) {
  const path = contentRelative(meta);
  const translated = new URL(path.replace(/meta\.json$/, 'meta.zh-CN.json'), contentDir);
  if (!(await exists(translated))) {
    broken.push({
      page: path,
      url: contentRelative(translated),
      target: 'missing Simplified Chinese navigation metadata',
    });
  }
}

for (const htmlUrl of htmlFiles) {
  const html = await readFile(htmlUrl, 'utf8');

  if (basePath && html.includes(`${basePath}${basePath}/`)) {
    broken.push({
      page: relative(outputDir.pathname, htmlUrl.pathname),
      url: `${basePath}${basePath}/`,
      target: 'duplicated basePath',
    });
  }

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

for (const page of englishPages) {
  const slug = slugFromEnglishPage(contentRelative(page));
  if (!slug) continue;

  for (const prefix of ['', 'zh-CN/']) {
    const outputPage = new URL(`${prefix}${slug}/index.html`, outputDir);
    if (!(await exists(outputPage))) {
      broken.push({
        page: 'translation coverage',
        url: `/${prefix}${slug}`,
        target: 'missing generated page',
      });
    }
  }
}

const englishHome = await readFile(new URL('index.html', outputDir), 'utf8');
const chineseHome = await readFile(new URL('zh-CN/index.html', outputDir), 'utf8');
const englishQuickstart = await readFile(new URL('getting-started/index.html', outputDir), 'utf8');
const chineseQuickstart = await readFile(
  new URL('zh-CN/getting-started/index.html', outputDir),
  'utf8',
);

const expectedEnglishOg = `${siteUrl}/og/docs/getting-started/image.png`;
const expectedChineseOg = `${siteUrl}/zh-CN/og/docs/getting-started/image.png`;

if (readLang(englishQuickstart) !== 'en') {
  console.error(`English page has wrong html lang: ${readLang(englishQuickstart) ?? 'missing'}`);
  process.exitCode = 1;
}
if (readLang(chineseQuickstart) !== 'zh-CN') {
  console.error(`Chinese page has wrong html lang: ${readLang(chineseQuickstart) ?? 'missing'}`);
  process.exitCode = 1;
}
if (readOgImage(englishQuickstart) !== expectedEnglishOg) {
  console.error(
    `Unexpected English og:image: ${readOgImage(englishQuickstart) ?? 'missing'}; expected ${expectedEnglishOg}`,
  );
  process.exitCode = 1;
}
if (readOgImage(chineseQuickstart) !== expectedChineseOg) {
  console.error(
    `Unexpected Chinese og:image: ${readOgImage(chineseQuickstart) ?? 'missing'}; expected ${expectedChineseOg}`,
  );
  process.exitCode = 1;
}

const chineseHomeHref = `${basePath}/zh-CN/`.replace(/^$/, '/zh-CN/');
const englishHomeHref = `${basePath}/`.replace(/^$/, '/');
if (!englishHome.includes(`href="${chineseHomeHref}"`)) {
  console.error('English homepage is missing the Simplified Chinese entry.');
  process.exitCode = 1;
}
if (!chineseHome.includes(`href="${englishHomeHref}"`)) {
  console.error('Chinese homepage is missing the English entry.');
  process.exitCode = 1;
}

const searchText = await readFile(new URL('api/search', outputDir), 'utf8');
const search = JSON.parse(searchText);
const searchDocuments = search.internalDocumentIDStore?.internalIdToId?.length ?? 0;
const englishSearchRecords = searchText.match(/"locale":"en"/g)?.length ?? 0;
const chineseSearchRecords = searchText.match(/"locale":"zh-CN"/g)?.length ?? 0;

if (!search.i18n || searchDocuments === 0 || englishSearchRecords === 0 || chineseSearchRecords === 0) {
  console.error(
    `Static search index is incomplete: i18n=${String(search.i18n)}, total=${searchDocuments}, en=${englishSearchRecords}, zh-CN=${chineseSearchRecords}`,
  );
  process.exitCode = 1;
}

const englishLlms = await readFile(new URL('llms.txt', outputDir), 'utf8');
const chineseLlms = await readFile(new URL('zh-CN/llms.txt', outputDir), 'utf8');
const expectedEnglishQuickstart = `${siteUrl}/getting-started`;
const expectedChineseQuickstart = `${siteUrl}/zh-CN/getting-started`;
const englishMarkdown = await readFile(
  new URL('llms.mdx/docs/getting-started/content.md', outputDir),
  'utf8',
);
const chineseMarkdown = await readFile(
  new URL('zh-CN/llms.mdx/docs/getting-started/content.md', outputDir),
  'utf8',
);

if (
  !englishLlms.includes(expectedEnglishQuickstart) ||
  !englishMarkdown.includes(expectedEnglishQuickstart)
) {
  console.error('English LLM outputs do not contain the public absolute quickstart URL.');
  process.exitCode = 1;
}
if (
  !chineseLlms.includes(expectedChineseQuickstart) ||
  !chineseMarkdown.includes(expectedChineseQuickstart) ||
  !chineseLlms.includes('快速开始')
) {
  console.error('Chinese LLM outputs are missing localized content or public URLs.');
  process.exitCode = 1;
}

if (broken.length > 0) {
  console.error('Broken static references:');
  for (const item of broken.slice(0, 50)) console.error(item);
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(
    `Static export OK: ${htmlFiles.length} HTML files, ${englishPages.length} bilingual content pages, ${checked} local references, ${searchDocuments} search records (${englishSearchRecords} en / ${chineseSearchRecords} zh-CN locale entries).`,
  );
}
