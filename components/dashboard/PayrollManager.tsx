'use client';
import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/client';
import { PAY_BANDS, REVIEW_WEIGHT, bandFor, computePay, currentMonth, money } from '@/lib/payroll';
import type { PayrollRecord, StaffMember, StaffReview } from '@/lib/types';
import { ErrorNote, card, inputClass } from './ui';

export default function PayrollManager({ staff, reviews }: { staff: StaffMember[]; reviews: StaffReview[] }) {
  const [month, setMonth] = useState(currentMonth());
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRecords((await api<{ records: PayrollRecord[] }>(`/api/payroll?month=${month}`)).records);
    } catch (e) { setError((e as Error).message); }
  }, [month]);
  useEffect(() => { load(); }, [load]);

  async function calculate() {
    setBusy(true); setError('');
    try { setRecords((await api<{ records: PayrollRecord[] }>('/api/payroll', { method: 'POST', body: { month } })).records); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const replace = (r: PayrollRecord) => setRecords((prev) => prev.map((x) => (x.id === r.id ? r : x)));

  // Saved record if there is one, otherwise a live preview from current reviews.
  const rows = staff.filter((s) => s.active || records.some((r) => r.staffId === s.id)).map((s) => {
    const rec = records.find((r) => r.staffId === s.id);
    return { s, rec, preview: rec ? null : { ...computePay(s, month, reviews), staffId: s.id } };
  });
  const total = rows.reduce((n, { rec, preview }) => n + (rec?.net ?? preview?.net ?? 0), 0);
  const paid = records.filter((r) => r.status === 'paid').reduce((n, r) => n + r.net, 0);

  return (
    <div className="space-y-6">
      <div className={`${card} flex flex-wrap items-end justify-between gap-4`}>
        <label className="text-sm font-semibold text-brand-primary">
          Pay month
          <input type="month" className={`${inputClass} mt-1 block`} value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </label>
        <div className="text-sm">
          <p>Total payroll: <strong>{money(total)}</strong></p>
          <p className="text-zinc-500">Paid so far: {money(paid)} · Outstanding: {money(Math.max(0, total - paid))}</p>
        </div>
        <Button onClick={calculate} disabled={busy}>{busy ? 'Calculating…' : records.length ? 'Recalculate pending' : 'Calculate payroll'}</Button>
      </div>
      <ErrorNote message={error} />

      <section className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr><th className="py-2">Staff</th><th>Base</th><th>Reviews</th><th>Mgr</th><th>Score</th><th>Adj.</th><th>Bonus</th><th>Deduct</th><th>Net pay</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-brand-primary/10 dark:divide-zinc-800">
            {rows.map(({ s, rec, preview }) => {
              const v = rec ?? preview!;
              return rec ? (
                <PayRow key={s.id} rec={rec} onChange={replace} onError={setError} />
              ) : (
                <tr key={s.id} className="text-zinc-500">
                  <td className="py-2.5"><span className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span><br /><span className="text-xs">{s.post}</span></td>
                  <td>{money(s.baseSalary)}</td>
                  <td>{v.customerAvg ? `${v.customerAvg.toFixed(1)} (${v.reviewCount})` : '–'}</td>
                  <td>{v.managerScore.toFixed(1)}</td>
                  <td>{v.performanceScore.toFixed(2)}</td>
                  <td>{v.adjustmentPct > 0 ? '+' : ''}{v.adjustmentPct}%</td>
                  <td>–</td><td>–</td>
                  <td className="font-semibold">{money(v.net)}</td>
                  <td className="text-xs">Preview — not saved</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={card}>
        <h3 className="text-lg font-semibold text-brand-accent dark:text-brand-light">How salaries are worked out</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Performance score = {REVIEW_WEIGHT * 100}% average customer review that month + {100 - REVIEW_WEIGHT * 100}% your manager score
          (manager score only, if nobody reviewed them). Excluded reviews are ignored. Net pay = base × (1 + adjustment) + bonus − deduction.
        </p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-5">
          {PAY_BANDS.map((b) => (
            <li key={b.min} className="rounded-md bg-brand-secondary px-3 py-2 dark:bg-zinc-800">
              <p className="font-semibold">{b.min === 0 ? 'Below 3.0' : `${b.min.toFixed(1)}+`}</p>
              <p>{b.pct > 0 ? '+' : ''}{b.pct}% · {b.label}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PayRow({ rec, onChange, onError }: { rec: PayrollRecord; onChange: (r: PayrollRecord) => void; onError: (m: string) => void }) {
  const [bonus, setBonus] = useState(String(rec.bonus));
  const [deduction, setDeduction] = useState(String(rec.deduction));
  const paid = rec.status === 'paid';
  const dirty = Number(bonus) !== rec.bonus || Number(deduction) !== rec.deduction;

  async function patch(body: Record<string, unknown>) {
    onError('');
    try { onChange((await api<{ record: PayrollRecord }>(`/api/payroll/${rec.id}`, { method: 'PATCH', body })).record); }
    catch (e) { onError((e as Error).message); }
  }

  return (
    <tr>
      <td className="py-2.5"><span className="font-medium">{rec.staffName}</span><br /><span className="text-xs text-zinc-500">{rec.post}</span></td>
      <td>{money(rec.baseSalary)}</td>
      <td>{rec.customerAvg ? `${rec.customerAvg.toFixed(1)} (${rec.reviewCount})` : '–'}</td>
      <td>{rec.managerScore.toFixed(1)}</td>
      <td title={bandFor(rec.performanceScore).label}>{rec.performanceScore.toFixed(2)}</td>
      <td>{rec.adjustmentPct > 0 ? '+' : ''}{rec.adjustmentPct}%</td>
      <td><input aria-label={`Bonus for ${rec.staffName}`} className={`${inputClass} !w-20`} type="number" min={0} step="0.01" value={bonus} disabled={paid} onChange={(e) => setBonus(e.target.value)} /></td>
      <td><input aria-label={`Deduction for ${rec.staffName}`} className={`${inputClass} !w-20`} type="number" min={0} step="0.01" value={deduction} disabled={paid} onChange={(e) => setDeduction(e.target.value)} /></td>
      <td className="font-semibold">{money(rec.net)}</td>
      <td className="space-y-1 whitespace-nowrap">
        {dirty && !paid && <button className="block text-xs font-semibold text-brand-primary underline" onClick={() => patch({ bonus: Number(bonus), deduction: Number(deduction) })}>Save changes</button>}
        {paid ? (
          <button className="text-xs text-emerald-700 underline dark:text-emerald-400" onClick={() => patch({ status: 'pending' })}>Paid ✓ (undo)</button>
        ) : (
          <button className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" onClick={() => patch({ status: 'paid' })}>Mark paid</button>
        )}
      </td>
    </tr>
  );
}
