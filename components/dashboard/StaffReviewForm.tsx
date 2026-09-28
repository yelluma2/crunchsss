'use client';
import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { api, formatDate } from '@/lib/client';
import type { StaffReview } from '@/lib/types';
import { ErrorNote, Field, StarPicker, Stars, card, inputClass } from './ui';

interface PublicStaff {
  id: string;
  name: string;
  post: string;
  department: string;
}

// Customer portal: rate a staff member, and see your own past reviews.
export default function StaffReviewForm() {
  const [staff, setStaff] = useState<PublicStaff[]>([]);
  const [mine, setMine] = useState<StaffReview[]>([]);
  const [staffId, setStaffId] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        api<{ staff: PublicStaff[] }>('/api/staff'),
        api<{ reviews: StaffReview[] }>('/api/staff-reviews'),
      ]);
      setStaff(s.staff);
      setMine(r.reviews);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError('Please choose a star rating.');
    setBusy(true);
    setError('');
    setDone(false);
    try {
      await api('/api/staff-reviews', { method: 'POST', body: { staffId, rating, comment } });
      setStaffId('');
      setRating(undefined);
      setComment('');
      setDone(true);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const nameOf = (id: string) => staff.find((s) => s.id === id)?.name ?? 'Former team member';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <h2 className="text-2xl font-semibold text-brand-accent dark:text-brand-light">How did we do?</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pick the team member who looked after you. Your review is used by the owner when monthly performance and pay are worked out.
        </p>
        <Field label="Staff member">
          <select className={inputClass} value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
            <option value="">Choose someone…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.post}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <span className="mb-1 block text-sm font-semibold text-brand-primary">Your rating</span>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Field label="Comment">
          <textarea className={`${inputClass} min-h-28`} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} required />
        </Field>
        <ErrorNote message={error} />
        {done && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Thank you! Your review was sent.</p>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Submit review'}
        </Button>
      </form>

      <section className={card}>
        <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Your reviews</h3>
        <ul className="mt-3 divide-y divide-brand-primary/10 dark:divide-zinc-800">
          {mine.length === 0 && <li className="py-3 text-sm text-zinc-500">You haven’t reviewed anyone yet.</li>}
          {mine.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{nameOf(r.staffId)}</span>
                <Stars value={r.rating} />
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{r.comment}</p>
              <p className="mt-1 text-xs text-zinc-500">{formatDate(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
