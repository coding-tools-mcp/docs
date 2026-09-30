import { defineI18n } from 'fumadocs-core/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { zhCN } from '@fumadocs/language/zh-cn';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'zh-CN'],
  hideLocale: 'default-locale',
  fallbackLanguage: 'en',
});

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .preset('zh-CN', zhCN());

export type DocsLocale = (typeof i18n.languages)[number];

export function isDocsLocale(value: string): value is DocsLocale {
  return i18n.languages.includes(value as DocsLocale);
}
