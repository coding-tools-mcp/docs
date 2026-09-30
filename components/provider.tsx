'use client';

import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SearchDialog from '@/components/search';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations, type DocsLocale } from '@/lib/i18n';

export function Provider({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: DocsLocale;
}) {
  return (
    <RootProvider
      i18n={i18nProvider(translations, locale)}
      search={{ SearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
