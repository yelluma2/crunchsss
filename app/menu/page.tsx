import type { Metadata } from 'next';
import MenuBrowser from '@/components/sections/MenuBrowser';
import { getMenu } from '@/lib/store';

export const metadata: Metadata = { title: 'Menu' };
export const dynamic = 'force-dynamic'; // dishes are edited from the dashboard

export default async function MenuPage() {
  const items = (await getMenu()).filter((i) => i.available !== false);
  return <MenuBrowser menuItems={items} />;
}
