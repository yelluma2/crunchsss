import Hero from '@/components/sections/Hero';
import FeaturedDishes from '@/components/sections/FeaturedDishes';
import OpeningHours from '@/components/sections/OpeningHours';
import { getHours } from '@/lib/store';

// content is edited from the dashboard, so render on every request
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const hours = await getHours();
  return (
    <>
      <Hero />
      <FeaturedDishes />
      <section className="border-y border-brand-primary/15 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <OpeningHours hours={hours} />
        </div>
      </section>
    </>
  );
}
