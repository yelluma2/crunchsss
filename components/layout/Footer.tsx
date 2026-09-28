import Image from 'next/image';
import Link from 'next/link';
import { contactInfo, navLinks, siteConfig } from '@/data/site';

export default function Footer() {
  return (
    <footer className="bg-brand-accent text-brand-secondary dark:bg-zinc-900 dark:text-zinc-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.svg" alt="" width={36} height={36} />
            <span className="font-serif text-xl font-semibold">{siteConfig.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-80">
            {siteConfig.tagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-base font-semibold">Pages</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="opacity-80 hover:opacity-100">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="text-sm not-italic leading-relaxed">
          <h2 className="text-base font-semibold">Find us</h2>
          <p className="mt-3 opacity-80">{contactInfo.address}</p>
          <p className="mt-2">
            <a href={contactInfo.phoneHref} className="opacity-80 hover:opacity-100">
              {contactInfo.phone}
            </a>
          </p>
        </address>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  );
}
