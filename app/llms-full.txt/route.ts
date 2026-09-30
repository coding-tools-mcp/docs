import { docsLlms } from '@/lib/source';
import { absolutizeMarkdownLinks } from '@/lib/shared';

export const revalidate = false;

export async function GET() {
  return new Response(absolutizeMarkdownLinks(await docsLlms.full()), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
