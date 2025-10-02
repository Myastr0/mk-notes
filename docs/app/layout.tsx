import '@/app/global.css';
import DefaultSearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Mk Notes - Seamlessly sync Markdown files to Notion',
    template: '%s | Mk Notes'
  },
  description: 'Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration. Transform your documentation workflow with a single command.',
  keywords: ['markdown', 'notion', 'documentation', 'sync', 'git', 'developer tools', 'workflow'],
  authors: [{ name: 'Mk Notes Team' }],
  creator: 'Myastr0',
  publisher: 'Mk Notes',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#000000',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mk-notes.io',
    siteName: 'Mk Notes',
    title: 'Mk Notes - Seamlessly sync Markdown files to Notion',
    description: 'Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration. Transform your documentation workflow with a single command.',
    images: [
      {
        url: 'https://www.mk-notes.io/mk-notes-banner.png',
        width: 1200,
        height: 630,
        alt: 'Mk Notes - Sync Markdown to Notion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mk Notes - Seamlessly sync Markdown files to Notion',
    description: 'Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration.',
    images: ['https://www.mk-notes.io/mk-notes-banner.png'],
  },
  alternates: {
    canonical: 'https://www.mk-notes.io',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        {/* Redirect script for docs.mk-notes.io -> www.mk-notes.io */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'docs.mk-notes.io') {
                window.location.replace('https://www.mk-notes.io' + window.location.pathname + window.location.search + window.location.hash);
              }
            `,
          }}
        />
        {/* Additional favicon links for better browser support */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#000000" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
        <RootProvider
          theme={{
            enabled: true,
          }}
          search={{
            SearchDialog: DefaultSearchDialog,
          }}>{children}</RootProvider>
      </body>
    </html>
  );
}
