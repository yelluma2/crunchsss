'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { navLinks, siteConfig } from '@/data/site';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    `font-medium transition-colors hover:text-brand-primary ${
      pathname === href
        ? 'text-brand-primary'
        : 'text-zinc-700 dark:text-zinc-200'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-primary/20 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/images/logo.svg" alt="Crunch’s logo" width={40} height={40} priority />
          <span className="font-serif text-2xl font-semibold text-brand-accent dark:text-brand-light">
            {siteConfig.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-brand-primary/15 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-2.5 ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
