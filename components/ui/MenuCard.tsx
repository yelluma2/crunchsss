import Image from 'next/image';
import { formatPrice, type MenuItem } from '@/data/menu';

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-brand-primary/15 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-[4/3] bg-brand-secondary dark:bg-zinc-800">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 350px, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-brand-accent dark:text-zinc-100">
          {item.name}
        </h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
        <p className="mt-4 text-right font-serif text-lg font-semibold text-brand-primary dark:text-brand-light">
          {formatPrice(item.price)}
        </p>
      </div>
    </article>
  );
}
