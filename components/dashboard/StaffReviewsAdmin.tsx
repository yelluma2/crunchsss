'use client';
import { useState } from 'react';
import { api, formatDate } from '@/lib/client';
import { currentMonth } from '@/lib/payroll';
import type { StaffMember, StaffReview } from '@/lib/types';
import { ErrorNote, Stars, card, inputClass } from './ui';

const avg = (rs: StaffReview[]) => (rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : null);

export default function StaffReviewsAdmin({
  staff, reviews, setReviews,
}: { staff: StaffMember[]; reviews: StaffReview[]; setReviews: (r: StaffReview[]) => void }) {
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const month = currentMonth();
  const nameOf = (id: string) => staff.find((s) => s.id === id)?.name ?? 'Former team member';
  const visible = reviews.filter((r) => filter === 'all' || r.staffId === filter);

  async function toggleFlag(r: StaffReview) {
    try {
      const d = await api<{ review: StaffReview }>(`/api/staff-reviews/${r.id}`, { method: 'PATCH', body: { flagged: !r.flagged } });
      setReviews(reviews.map((x) => (x.id === r.id ? d.review : x)));
    } catch (e) { setError((e as Error).message); }
  }
  async function del(r: StaffReview) {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api(`/api/staff-reviews/${r.id}`, { method: 'DELETE' });
      setReviews(reviews.filter((x) => x.id !== r.id));
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.filter((s) => s.active).map((s) => {
          const all = reviews.filter((r) => r.staffId === s.id && !r.flagged);
          const m = all.filter((r) => r.createdAt.startsWith(month));
          const a = avg(all), am = avg(m);
          return (
            <button key={s.id} onClick={() => setFilter(filter === s.id ? 'all' : s.id)}
              className={`${card} text-left ${filter === s.id ? 'border-brand-primary' : ''}`}>
              <p className="font-semibold text-brand-accent dark:text-brand-light">{s.name}</p>
              <p className="text-xs text-zinc-500">{s.post}</p>
              <p className="mt-2 text-sm">{a ? <><Stars value={Math.round(a)} /> {a.toFixed(1)} <span className="text-zinc-500">({all.length})</span></> : <span className="text-zinc-500">No reviews yet</span>}</p>
              <p className="mt-1 text-xs text-zinc-500">This month: {am ? `${am.toFixed(1)} from ${m.length}` : '–'}</p>
            </button>
          );
        })}
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Customer reviews of staff</h3>
          <select className={`${inputClass} !w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by staff member">
            <option value="all">Everyone</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <ErrorNote message={error} />
        <ul className="mt-3 divide-y divide-brand-primary/10 dark:divide-zinc-800">
          {visible.length === 0 && <li className="py-4 text-sm text-zinc-500">No reviews to show.</li>}
          {visible.map((r) => (
            <li key={r.id} className={`py-3 text-sm ${r.flagged ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span><strong>{nameOf(r.staffId)}</strong> <Stars value={r.rating} /> {r.flagged && <em className="text-xs text-rose-600">excluded from pay</em>}</span>
                <span className="space-x-3 text-xs">
                  <button className="font-semibold text-brand-primary underline" onClick={() => toggleFlag(r)}>{r.flagged ? 'Include in pay' : 'Exclude from pay'}</button>
                  <button className="text-rose-600 underline" onClick={() => del(r)}>Delete</button>
                </span>
              </div>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{r.comment}</p>
              <p className="mt-1 text-xs text-zinc-500">{r.userName} · {formatDate(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
