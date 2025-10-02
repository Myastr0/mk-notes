import { ArrowRight } from "lucide-react";
import React from "react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface HeroProps {
  heading?: string;
  description?: string;
  primaryButton?: {
    text: string;
    url: string;
  };
  command?: string;
  githubStars?: number;
}

const Hero = ({
  heading = "Seamlessly sync your Markdown files to Notion",
  description = "Keep writing in Markdown, version control with Git, and let Mk Notes handle the Notion integration. Transform your documentation workflow with a single command.",
  primaryButton = {
    text: "Start synchronizing",
    url: "/docs",
  },
  command = "$ mk-notes sync",
}: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/20 to-background py-24 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,hsl(var(--foreground)),rgba(255,255,255,0))] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-pulse">
        <div className="h-20 w-20 rounded-full bg-primary/20 blur-xl"></div>
      </div>
      <div className="absolute bottom-20 right-10 animate-pulse delay-1000">
        <div className="h-32 w-32 rounded-full bg-primary/10 blur-xl"></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo size="xl" color="auto"/>
          </div>
          
          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {heading}
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mb-12 max-w-3xl text-xl text-muted-foreground sm:text-2xl">
            {description}
          </p>
          
          {/* Command Demo */}
          <div className="mx-auto mb-12 max-w-2xl">
            <div className="relative rounded-xl bg-card/80 p-6 backdrop-blur-sm border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-destructive"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <code className="text-lg font-mono text-green-500 sm:text-xl">
                {command}
              </code>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-lg">
              <Link href={primaryButton.url} className="inline-flex items-center">
                {primaryButton.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export { Hero };
