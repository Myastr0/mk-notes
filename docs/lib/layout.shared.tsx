import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/ui/logo';


/**
 * Theme-aware logo component that switches between light and dark versions
 */
function ThemeAwareLogo() {
  return (
    <div className="relative">
      {/* Light theme logo */}
      <Logo size='xxs' variant='icon'/>
    </div>
  );
}

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/Myastr0/mk-notes",
    nav: {
      title: (
        <>
          <ThemeAwareLogo />
          Mk Notes
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
  };
}
