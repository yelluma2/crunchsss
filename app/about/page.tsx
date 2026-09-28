import type { Metadata } from 'next';
import { aboutStory, team } from '@/data/site';

export const metadata: Metadata = { title: 'About' };

const initials = (name: string) =>
  name.split(' ').map((part) => part[0]).join('');

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="mx-auto max-w-2xl">
        <h1 className="text-center text-4xl font-semibold text-brand-accent dark:text-brand-light sm:text-5xl">
          Our Story
        </h1>
        <div className="mt-8 space-y-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          {aboutStory.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-3xl font-semibold text-brand-accent dark:text-brand-light">
          Meet the Team
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <article
              key={member.name}
              className="rounded-lg border border-brand-primary/15 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                aria-hidden="true"
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-light/50 font-serif text-3xl text-brand-accent dark:bg-zinc-800 dark:text-brand-light"
              >
                {initials(member.name)}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{member.name}</h3>
              <p className="text-sm font-medium text-brand-primary">{member.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {member.bio}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
