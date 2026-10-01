import Link from 'next/link';
import { ArrowRight, GitBranch, GitFork, Monitor, ShieldCheck, TerminalSquare } from 'lucide-react';
import { coreRepositoryUrl, desktopRepositoryUrl, withBasePath } from '@/lib/shared';

const features = [
  {
    icon: TerminalSquare,
    title: '通过 MCP 提供完整编码工具',
    description: '在一个与模型无关的 runtime 中提供文件、结构化补丁、命令执行、交互式进程与 Git 能力。',
  },
  {
    icon: ShieldCheck,
    title: '默认限制在工作区内',
    description: '权限模式、路径边界、敏感变量过滤与可选的 Linux Landlock，让 agent 的访问范围保持明确。',
  },
  {
    icon: Monitor,
    title: '继续使用你熟悉的客户端',
    description: '支持 ChatGPT、Claude Desktop、Claude Code、Cursor、VS Code、Windsurf、Cline、Gemini CLI 或自定义 agent。',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20 lg:py-28">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-fd-muted-foreground">
            Model-neutral coding runtime
          </p>
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            给 AI agent 一双可以安全操作真实代码库的手。
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-fd-muted-foreground">
            Coding Tools MCP 通过 Model Context Protocol 提供生产级文件、命令执行与 Git 工具，
            并把所有操作限制在你明确指定的工作区中。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/zh-CN/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground"
            >
              快速开始 <ArrowRight className="size-4" />
            </Link>
            <a
              href={coreRepositoryUrl}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium"
            >
              <GitBranch className="size-4" /> Core 仓库
            </a>
            <a
              href={desktopRepositoryUrl}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium"
            >
              Desktop 应用
            </a>
            <a
              href={withBasePath('/')}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium"
            >
              English
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border bg-fd-card p-6">
              <Icon className="mb-4 size-5" />
              <h2 className="font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-dashed bg-fd-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium">
              <GitFork className="size-4" />
              生态与社区
            </div>
            <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
              查看官方配套项目，以及社区基于 Coding Tools MCP 构建的 downstream、发行版和集成，
              并明确区分支持范围与兼容性边界。
            </p>
          </div>
          <Link
            href="/zh-CN/ecosystem"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium"
          >
            查看生态项目 <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
