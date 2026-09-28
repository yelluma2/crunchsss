import type { Metadata } from 'next';
import OpeningHours from '@/components/sections/OpeningHours';
import { contactInfo } from '@/data/site';
import { getHours } from '@/lib/store';

export const metadata: Metadata = { title: 'Contact' };
export const dynamic = 'force-dynamic';

const card =
  'rounded-lg border border-brand-primary/15 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900';
const label = 'text-sm font-semibold text-brand-primary';

export default async function ContactPage() {
  const hours = await getHours();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-center text-4xl font-semibold text-brand-accent dark:text-brand-light sm:text-5xl">
        Get in Touch
      </h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className={card}>
          <h2 className="text-center text-3xl font-semibold text-brand-accent dark:text-brand-light">Visit or call</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className={label}>Address</dt>
              <dd className="mt-1">{contactInfo.address}</dd>
            </div>
            <div>
              <dt className={label}>Phone</dt>
              <dd className="mt-1">
                <a href={contactInfo.phoneHref} className="hover:text-brand-primary">{contactInfo.phone}</a>
              </dd>
            </div>
            <div>
              <dt className={label}>Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${contactInfo.email}`} className="hover:text-brand-primary">{contactInfo.email}</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={card}>
          <OpeningHours hours={hours} title="Hours" />
        </section>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-brand-primary/15 dark:border-zinc-800">
        <iframe
          title="Map showing the location of Crunch’s"
          src={contactInfo.mapSrc}
          className="h-96 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
