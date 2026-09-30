import Link from 'next/link';
import { ArrowRight, GitBranch, Monitor, ShieldCheck, TerminalSquare } from 'lucide-react';
import { coreRepositoryUrl, desktopRepositoryUrl } from '@/lib/shared';

const features = [
  {
    icon: TerminalSquare,
    title: 'Coding tools over MCP',
    description: 'Files, structured patches, command execution, interactive processes, and Git through one model-neutral runtime.',
  },
  {
    icon: ShieldCheck,
    title: 'Workspace-confined by design',
    description: 'Permission modes, path boundaries, secret filtering, and optional Linux Landlock keep agent access explicit.',
  },
  {
    icon: Monitor,
    title: 'Use the client you already have',
    description: 'Connect ChatGPT, Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Cline, Gemini CLI, or your own agent.',
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
            Give AI agents a safe pair of hands on your codebase.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-fd-muted-foreground">
            Coding Tools MCP exposes production-grade file, execution, and Git tools through the Model Context Protocol,
            confined to the workspace you choose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground"
            >
              Get started <ArrowRight className="size-4" />
            </Link>
            <a
              href={coreRepositoryUrl}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium"
            >
              <GitBranch className="size-4" /> Core repository
            </a>
            <a
              href={desktopRepositoryUrl}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium"
            >
              Desktop app
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
      </section>
    </main>
  );
}
