import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog } from '@/lib/source';
import { buttonVariants } from '@/components/ui/button';
import path from 'node:path';
import { cn } from '@/lib/cn';
import { MDXContent } from '@content-collections/mdx/react';
import { getMDXComponents } from '@/mdx-components';
import { Author } from './-parts/author';

export default async function Page(props: PageProps<'/blog/[...slug]'>) {
  const params = await props.params;
  const page = blog.getPage(params.slug);

  if (!page) notFound();
  const { toc } = page.data;

  return (
    <article className="flex flex-col mx-auto w-full max-w-[800px] px-4 py-8">
      <div className="flex flex-row items-center gap-6 text-sm mb-8">
        <div>
          <p className="mb-2 text-fd-muted-foreground text-xs uppercase tracking-wide">
            Written by
          </p>
          <Author authorId={page.data.author} variant="compact" />
        </div>
        <div className="h-8 w-px bg-fd-border" />
        <div>
          <p className="mb-2 text-fd-muted-foreground text-xs uppercase tracking-wide">
            Published
          </p>
          <p className="font-medium text-sm">
            {new Date(
              page.data.date ??
                path.basename(page.path, path.extname(page.path))
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-4">{page.data.title}</h1>
      <p className="text-fd-muted-foreground mb-8">{page.data.description}</p>

      <div className="prose min-w-0 flex-1">
        <div className="flex flex-row gap-2 mb-8 not-prose">
          <Link
            href="/blog"
            className={cn(
              buttonVariants({
                size: 'sm',
                variant: 'secondary',
              })
            )}
          >
            Back
          </Link>
        </div>

        {toc && toc.length > 0 ? (
          <InlineTOC items={toc} />
        ) : (
          <div className=" border-b border-fd-border" />
        )}
        <MDXContent code={page.data.body} components={getMDXComponents()} />
      </div>

      {/* Full author card at the bottom */}
      <div className="mt-12 pt-8 border-t border-fd-border">
        <p className="text-fd-muted-foreground text-xs uppercase tracking-wide mb-4">
          About the author
        </p>
        <Author authorId={page.data.author} variant="full" />
      </div>
    </article>
  );
}

export async function generateMetadata(
  props: PageProps<'/blog/[...slug]'>
): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description:
      page.data.description ?? 'Latest news and updates about Mk Notes',
  };
}

export function generateStaticParams(): { slug: string }[] {
  return blog.generateParams();
}
