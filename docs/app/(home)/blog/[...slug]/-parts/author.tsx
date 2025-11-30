import Image from 'next/image';
import Link from 'next/link';
import { getAuthorById } from '@/lib/source';
import type { AuthorWithId } from '@/collections/authors';
import { cn } from '@/lib/cn';

interface AuthorProps {
  authorId: string;
  variant?: 'compact' | 'full';
  className?: string;
  /** Disable link wrapping - use when Author is inside another clickable element */
  disableLink?: boolean;
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function AuthorAvatar({
  author,
  size = 'md',
}: {
  author: AuthorWithId;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  if (!author.image_url) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-gradient-to-br from-fd-primary/40 to-fd-primary/80 flex items-center justify-center text-fd-primary-foreground font-semibold'
        )}
      >
        {author.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={author.image_url}
      alt={author.name}
      width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      className={cn(
        sizeClasses[size],
        'rounded-full object-cover ring-2 ring-fd-border'
      )}
    />
  );
}

function SocialLinks({ author }: { author: AuthorWithId }) {
  if (!author.socials) return null;

  const { github, linkedin, twitter } = author.socials;

  return (
    <div className="flex items-center gap-2">
      {github && (
        <Link
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          aria-label={`${author.name}'s GitHub`}
        >
          <GithubIcon className="h-4 w-4" />
        </Link>
      )}
      {linkedin && (
        <Link
          href={`https://linkedin.com/in/${linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          aria-label={`${author.name}'s LinkedIn`}
        >
          <LinkedInIcon className="h-4 w-4" />
        </Link>
      )}
      {twitter && (
        <Link
          href={`https://twitter.com/${twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
          aria-label={`${author.name}'s Twitter`}
        >
          <TwitterIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/**
 * Compact author display - shows avatar, name, and title in a row
 */
function AuthorCompact({
  author,
  className,
  disableLink = false,
}: {
  author: AuthorWithId;
  className?: string;
  disableLink?: boolean;
}) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <AuthorAvatar author={author} size="sm" />
      <div className="flex flex-col">
        <span className="font-medium text-sm text-fd-foreground">
          {author.name}
        </span>
        {author.title && (
          <span className="text-xs text-fd-muted-foreground">
            {author.title}
          </span>
        )}
      </div>
    </div>
  );

  if (author.url && !disableLink) {
    return (
      <Link
        href={author.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Full author display - shows avatar, name, title, and social links
 */
function AuthorFull({
  author,
  className,
}: {
  author: AuthorWithId;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg bg-fd-card border border-fd-border',
        className
      )}
    >
      <AuthorAvatar author={author} size="lg" />
      <div className="flex flex-col gap-1">
        {author.url ? (
          <Link
            href={author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-fd-foreground hover:text-fd-primary transition-colors"
          >
            {author.name}
          </Link>
        ) : (
          <span className="font-semibold text-fd-foreground">
            {author.name}
          </span>
        )}
        {author.title && (
          <span className="text-sm text-fd-muted-foreground">
            {author.title}
          </span>
        )}
        <SocialLinks author={author} />
      </div>
    </div>
  );
}

/**
 * Author component that displays author information
 * Can be used with an author ID to automatically look up author data
 */
export function Author({
  authorId,
  variant = 'compact',
  className,
  disableLink = false,
}: AuthorProps) {
  const author = getAuthorById(authorId);

  if (!author) {
    return (
      <div className={cn('text-fd-muted-foreground text-sm', className)}>
        {authorId}
      </div>
    );
  }

  if (variant === 'full') {
    return <AuthorFull author={author} className={className} />;
  }

  return (
    <AuthorCompact
      author={author}
      className={className}
      disableLink={disableLink}
    />
  );
}

/**
 * Export individual components for custom compositions
 */
export { AuthorCompact, AuthorFull, AuthorAvatar, SocialLinks };
export type { AuthorProps };
