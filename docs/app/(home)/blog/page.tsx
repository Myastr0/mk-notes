import { blog } from '@/lib/source';
import type { Metadata } from 'next';
import Link from 'next/link';
import { basename, extname } from 'path';
import { Author } from './[...slug]/-parts/author';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest news and updates about MK Notes',
};

const getName = (path: string) => {
  return basename(path, extname(path));
};

function GrainOverlay() {
  return (
    <svg className="absolute inset-0 size-full opacity-50 pointer-events-none -z-1">
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

export default function BlogIndex() {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? getName(b.path)).getTime() -
      new Date(a.data.date ?? getName(a.path)).getTime()
  );

  return (
    <main className="mx-auto w-full max-w-page px-4 pb-12 md:py-12">
      <div className="relative dark mb-4 aspect-[3.2] p-8 z-2 md:p-12 rounded-xl overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0 -z-2"
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #465161 100%)',
          }}
        />
        {/* Grain texture overlay */}
        <GrainOverlay />
        <h1 className="mb-4 text-3xl text-white font-mono font-medium">
          Mk Notes Blog
        </h1>
        <p className="text-sm font-mono text-white/70">
          Latest announcements of Mk Notes.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="flex flex-col bg-fd-card rounded-2xl border shadow-sm p-4 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <p className="font-medium">{post.data.title}</p>
            <p className="text-sm text-fd-muted-foreground line-clamp-2">
              {post.data.description}
            </p>

            <div className="mt-auto pt-4 flex items-center justify-between gap-2">
              <Author
                authorId={post.data.author}
                variant="compact"
                disableLink
              />
              <p className="text-xs text-fd-muted-foreground whitespace-nowrap">
                {new Date(
                  post.data.date ?? getName(post.path)
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
