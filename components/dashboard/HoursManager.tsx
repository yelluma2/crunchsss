'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { DayHours } from '@/data/hours';
import { api } from '@/lib/client';
import { ErrorNote, card, inputClass } from './ui';

export default function HoursManager({
  hours,
  setHours,
}: {
  hours: DayHours[];
  setHours: (h: DayHours[]) => void;
}) {
  const [draft, setDraft] = useState<DayHours[]>(hours);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const update = (i: number, patch: Partial<DayHours>) => {
    setSaved(false);
    setDraft(draft.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api<{ hours: DayHours[] }>('/api/hours', { method: 'PUT', body: { hours: draft } });
      setHours(d.hours);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className={`${card} max-w-2xl space-y-4`}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        These times appear on the home and contact pages. The current day is highlighted for visitors automatically.
      </p>
      <ul className="divide-y divide-brand-primary/15 dark:divide-zinc-800">
        {draft.map((d, i) => (
          <li key={d.day} className="flex flex-wrap items-center gap-3 py-3">
            <span className="w-28 font-medium">{d.day}</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={d.closed === true} onChange={(e) => update(i, { closed: e.target.checked })} className="h-4 w-4 accent-[#A0653A]" />
              Closed
            </label>
            <input type="time" aria-label={`${d.day} opens`} disabled={d.closed} value={d.open} onChange={(e) => update(i, { open: e.target.value })} className={`${inputClass} !w-32 disabled:opacity-40`} />
            <span aria-hidden="true">–</span>
            <input type="time" aria-label={`${d.day} closes`} disabled={d.closed} value={d.close} onChange={(e) => update(i, { close: e.target.value })} className={`${inputClass} !w-32 disabled:opacity-40`} />
          </li>
        ))}
      </ul>
      <ErrorNote message={error} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save hours'}
        </Button>
        {saved && <span role="status" className="text-sm text-emerald-700 dark:text-emerald-400">Saved. The site is updated.</span>}
      </div>
    </form>
  );
}
