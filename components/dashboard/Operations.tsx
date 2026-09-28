'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { DayHours } from '@/data/hours';
import { api } from '@/lib/client';
import { SHIFT_LABELS, WEEK_DAYS, type RestaurantSettings, type Shift, type StaffMember } from '@/lib/types';
import { ErrorNote, Field, Toggle, card, inputClass } from './ui';

export default function Operations({
  staff, hours, settings, setSettings,
}: { staff: StaffMember[]; hours: DayHours[]; settings: RestaurantSettings; setSettings: (s: RestaurantSettings) => void }) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = hours.find((h) => h.day === today);
  const onDuty = staff.filter((s) => s.active && s.workDays.includes(today));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setSaved(false);
    try {
      setSettings((await api<{ settings: RestaurantSettings }>('/api/settings', { method: 'PUT', body: draft })).settings);
      setSaved(true);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className={`${card} space-y-4`}>
        <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Service status</h3>
        <label className="flex items-center gap-3 text-sm font-semibold text-brand-primary">
          <Toggle checked={draft.serviceOpen} onChange={(v) => { setDraft({ ...draft, serviceOpen: v }); setSaved(false); }} label="Taking orders and guests" />
          {draft.serviceOpen ? 'Open for service' : 'Temporarily closed'}
        </label>
        <Field label="Internal notice for the team" hint="e.g. “Fryer 2 out of order”, “Private event 7pm”.">
          <input className={inputClass} value={draft.notice} maxLength={200} onChange={(e) => { setDraft({ ...draft, notice: e.target.value }); setSaved(false); }} />
        </Field>
        <ErrorNote message={error} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save status'}</Button>
          {saved && <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved.</span>}
        </div>
      </form>

      <section className={card}>
        <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">On duty today ({today})</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Hours: {todayHours ? (todayHours.closed ? 'Closed' : `${todayHours.open}–${todayHours.close}`) : '–'}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {(Object.keys(SHIFT_LABELS) as Shift[]).map((k) => (
            <div key={k} className="rounded-md bg-brand-secondary p-3 dark:bg-zinc-800">
              <p className="text-sm font-semibold">{SHIFT_LABELS[k]}</p>
              <ul className="mt-1 text-sm">
                {onDuty.filter((s) => s.shift === k).map((s) => <li key={s.id}>{s.name} <span className="text-xs text-zinc-500">· {s.post}</span></li>)}
                {!onDuty.some((s) => s.shift === k) && <li className="text-zinc-500">Nobody</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} overflow-x-auto`}>
        <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Weekly coverage</h3>
        <table className="mt-3 w-full min-w-[560px] text-center text-sm">
          <thead className="text-xs uppercase text-zinc-500"><tr><th className="text-left">Team member</th>{WEEK_DAYS.map((d) => <th key={d}>{d.slice(0, 3)}</th>)}</tr></thead>
          <tbody className="divide-y divide-brand-primary/10 dark:divide-zinc-800">
            {staff.filter((s) => s.active).map((s) => (
              <tr key={s.id}>
                <td className="py-2 text-left">{s.name}</td>
                {WEEK_DAYS.map((d) => <td key={d}>{s.workDays.includes(d) ? <span className="text-brand-primary">●</span> : <span className="text-zinc-300 dark:text-zinc-600">–</span>}</td>)}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2 text-left">Headcount</td>
              {WEEK_DAYS.map((d) => <td key={d}>{staff.filter((s) => s.active && s.workDays.includes(d)).length}</td>)}
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-zinc-500">Change shifts and working days under the Staff tab. Menu and opening hours have their own tabs.</p>
      </section>
    </div>
  );
}
