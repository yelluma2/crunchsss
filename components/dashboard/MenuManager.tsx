'use client';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { formatPrice, menuTabs, type MenuItem } from '@/data/menu';
import { api } from '@/lib/client';
import { ErrorNote, Field, Toggle, card, inputClass } from './ui';

// Photos that already ship with the site. Admins can also type any /images/... path.
const KNOWN_IMAGES = [
  'burrata', 'calamari', 'tomato-soup', 'salmon', 'chicken', 'short-rib',
  'chocolate-cake', 'creme-brulee', 'cheesecake', 'hibiscus-tea', 'lemonade', 'cold-brew',
].map((n) => `/images/${n}.jpg`);

type Draft = Omit<MenuItem, 'id'> & { id?: number };

const blank: Draft = {
  name: '',
  description: '',
  price: 0,
  category: 'main',
  image: '',
  available: true,
  featured: false,
};

export default function MenuManager({
  items,
  setItems,
}: {
  items: MenuItem[];
  setItems: (items: MenuItem[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [priceText, setPriceText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  const visible = items.filter(
    (i) =>
      (tab === 'all' || i.category === tab) &&
      i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function startEdit(item?: MenuItem) {
    const d = item ? { ...item } : { ...blank };
    setDraft(d);
    setPriceText(item ? String(item.price) : '');
    setError('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      const body = { ...draft, price: Number(priceText) };
      if (draft.id) {
        const d = await api<{ item: MenuItem }>(`/api/menu/${draft.id}`, { method: 'PUT', body });
        setItems(items.map((i) => (i.id === d.item.id ? d.item : i)));
      } else {
        const d = await api<{ item: MenuItem }>('/api/menu', { method: 'POST', body });
        setItems([...items, d.item]);
      }
      setDraft(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Quick toggles straight from the list (available / featured)
  async function quickToggle(item: MenuItem, key: 'available' | 'featured', value: boolean) {
    const updated: MenuItem = key === 'available' ? { ...item, available: value } : { ...item, featured: value };
    setItems(items.map((i) => (i.id === item.id ? updated : i))); // optimistic
    try {
      await api(`/api/menu/${item.id}`, { method: 'PUT', body: updated });
    } catch (err) {
      setItems(items); // roll back
      setError((err as Error).message);
    }
  }

  async function remove(item: MenuItem) {
    if (!confirm(`Delete “${item.name}” from the menu?`)) return;
    try {
      await api(`/api/menu/${item.id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== item.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {menuTabs.map((t) => (
            <Button
              key={t.value}
              variant={tab === t.value ? 'primary' : 'outline'}
              pressed={tab === t.value}
              className="!px-4 !py-1.5"
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={`${inputClass} !w-48`}
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search dishes"
          />
          <Button onClick={() => startEdit()}>Add dish</Button>
        </div>
      </div>

      <ErrorNote message={draft ? '' : error} />

      {draft && (
        <form onSubmit={save} className={`${card} space-y-4`}>
          <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">
            {draft.id ? 'Edit dish' : 'Add a dish'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={80} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price ($)">
                <input className={inputClass} type="number" step="0.01" min="0" value={priceText} onChange={(e) => setPriceText(e.target.value)} required />
              </Field>
              <Field label="Category">
                <select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as MenuItem['category'] })}>
                  <option value="starter">Starter</option>
                  <option value="main">Main</option>
                  <option value="dessert">Dessert</option>
                  <option value="drink">Drink</option>
                </select>
              </Field>
            </div>
          </div>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-20`} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={300} required />
          </Field>
          <Field label="Image" hint="Pick a photo from public/images or type a path like /images/my-dish.jpg. Leave empty for no photo.">
            <input className={inputClass} list="known-images" value={draft.image ?? ''} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="/images/salmon.jpg" />
            <datalist id="known-images">
              {KNOWN_IMAGES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-3 text-sm font-medium">
              <Toggle label="Available" checked={draft.available !== false} onChange={(v) => setDraft({ ...draft, available: v })} />
              Available on the public menu
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Toggle label="Featured" checked={draft.featured === true} onChange={(v) => setDraft({ ...draft, featured: v })} />
              Featured on the home page
            </label>
          </div>
          <ErrorNote message={error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save dish'}
            </Button>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {visible.length === 0 && <li className="text-sm text-zinc-500">No dishes match.</li>}
        {visible.map((item) => (
          <li key={item.id} className={`${card} flex flex-wrap items-center gap-4 !p-3`}>
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-brand-secondary dark:bg-zinc-800">
              {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate font-semibold ${item.available === false ? 'text-zinc-400 line-through' : ''}`}>
                {item.name}
              </p>
              <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                {item.category} · {formatPrice(item.price)}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
              <Toggle label={`${item.name} available`} checked={item.available !== false} onChange={(v) => quickToggle(item, 'available', v)} />
              Available
            </label>
            <label className="flex items-center gap-2 text-xs font-medium">
              <Toggle label={`${item.name} featured`} checked={item.featured === true} onChange={(v) => quickToggle(item, 'featured', v)} />
              Featured
            </label>
            <div className="flex gap-2">
              <Button variant="outline" className="!px-3 !py-1.5" onClick={() => startEdit(item)}>
                Edit
              </Button>
              <Button variant="outline" className="!px-3 !py-1.5" onClick={() => remove(item)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
