import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import { siteUrl } from '@/lib/shared';
import '@/app/global.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Coding Tools MCP 中文文档',
    template: '%s | Coding Tools MCP',
  },
  description: 'Coding Tools MCP 简体中文文档：安装、配置、安全边界、客户端接入与使用指南。',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider locale="zh-CN">{children}</Provider>
      </body>
    </html>
  );
}
