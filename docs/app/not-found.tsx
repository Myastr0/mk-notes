import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RootProvider } from 'fumadocs-ui/provider';
import DefaultSearchDialog from '@/components/search';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <RootProvider
      theme={{
        enabled: true,
      }}
      search={{
        SearchDialog: DefaultSearchDialog,
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          {/* 404 Icon/Illustration */}

          <div className="mb-8 flex justify-center">
            <Logo size="xl" color="auto"/>
          </div>


          <div className="text-6xl font-bold text-muted-foreground">404</div>
          
          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or doesn&apos;t exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">
                Browse Documentation
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </RootProvider>
  );
}
