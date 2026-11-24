import { withBasePath } from '@/lib/shared';

type DocsVideoProps = {
  src: string;
  poster: string;
  label: string;
};

export function DocsVideo({ src, poster, label }: DocsVideoProps) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={withBasePath(poster)}
      src={withBasePath(src)}
      className="w-full rounded-xl border shadow-sm"
      aria-label={label}
    />
  );
}
