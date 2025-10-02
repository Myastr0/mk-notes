"use client";

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo'
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link'
import { useTheme } from 'next-themes';

const links = [
    {
        title: 'Documentation',
        href: '/docs',
    },
    { 
        title: 'Discord',
        href: 'https://discord.gg/AuVGNnyMfQ',
    },
    {
        title: 'GitHub',
        href: 'https://github.com/Myastr0/mk-notes',
    },
]

export function ModeToggle() {
    const { setTheme, theme } = useTheme();
  
    return (
      <Button
        variant="outline"
        className="size-8 mb-5"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit mb-12">
                    <Logo size="xl" color="auto"/>
                </Link>
                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>
                <span className="text-muted-foreground block text-center text-sm"> © {new Date().getFullYear()} Mk Notes, All rights reserved</span>
            </div>
        </footer>
    )
}