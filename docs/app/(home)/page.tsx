import React from 'react';
import { Hero } from './-parts/hero';
import { Features } from './-parts/features';
import { Benefits } from './-parts/benefits';
import type { Metadata } from 'next';
import FooterSection from './-parts/footer';

export const metadata: Metadata = {
  title: 'Mk Notes - Seamlessly sync Markdown files to Notion',
  description: 'Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration. Transform your documentation workflow with a single command.',
  keywords: ['markdown', 'notion', 'documentation', 'sync', 'git', 'developer tools', 'workflow'],
  authors: [{ name: 'Mk Notes Team' }],
  creator: 'Mk Notes',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mk-notes.io',
    siteName: 'Mk Notes',
    title: 'Mk Notes - Seamlessly sync Markdown files to Notion',
    description: 'Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration. Transform your documentation workflow with a single command.',
    images: [
      {
        url: '/mk-notes-banner.png',
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
    images: ['/mk-notes-banner.png'],
  },
  alternates: {
    canonical: 'https://mk-notes.io',
  },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mk Notes",
    "description": "Seamlessly sync Markdown files to Notion. Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration.",
    "url": "https://mk-notes.io",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Mk Notes Team"
    },
    "keywords": "markdown, notion, documentation, sync, git, developer tools, workflow",
    "programmingLanguage": "TypeScript",
    "license": "MIT"
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Hero Section */}
      <Hero githubStars={42} />

      {/* Features Section */}
      <Features />

      {/* Benefits Section */}
      <Benefits />

      <FooterSection/>
    </>
  );
}
