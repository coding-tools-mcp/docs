import { docsLlms, source } from '@/lib/source';
import { absolutizeMarkdownLinks, getPageMarkdownUrl } from '@/lib/shared';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/zh-CN/llms.mdx/docs/[[...slug]]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1), 'zh-CN');
  if (!page) notFound();

  return new Response(absolutizeMarkdownLinks(await docsLlms.page(page)), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export function generateStaticParams() {
  return source.getPages('zh-CN').map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
