'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import MenuCard from '@/components/ui/MenuCard';
import { menuTabs, type MenuItem, type MenuTab } from '@/data/menu';

export default function MenuBrowser({ menuItems }: { menuItems: MenuItem[] }) {
  const [active, setActive] = useState<MenuTab>('all');

  const visible =
    active === 'all' ? menuItems : menuItems.filter((i) => i.category === active);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-center text-4xl font-semibold text-brand-accent dark:text-brand-light sm:text-5xl">
        Our Menu
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Everything is cooked to order, so a busy Saturday may mean a short wait.
      </p>

      <div role="group" aria-label="Filter menu by category" className="mt-8 flex flex-wrap justify-center gap-2">
        {menuTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={active === tab.value ? 'primary' : 'outline'}
            pressed={active === tab.value}
            onClick={() => setActive(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
