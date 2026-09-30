import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import type { DocsLocale } from './i18n';

export function baseOptions(locale: DocsLocale = 'en'): BaseLayoutProps {
  return {
    nav: {
      title: appName,
      url: locale === 'zh-CN' ? '/zh-CN' : '/',
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
