import MenuCard from '@/components/ui/MenuCard';
import Button from '@/components/ui/Button';
import { getMenu } from '@/lib/store';

export default async function FeaturedDishes() {
  const featuredItems = (await getMenu()).filter((i) => i.featured && i.available !== false);
  if (featuredItems.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-3xl font-semibold text-brand-accent dark:text-brand-light sm:text-4xl">
        Featured Dishes
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-zinc-600 dark:text-zinc-400">
        The plates our regulars ask for by name.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {featuredItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/menu" variant="outline">
          See the full menu
        </Button>
      </div>
    </section>
  );
}
