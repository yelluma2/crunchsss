'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/client';
import { money } from '@/lib/payroll';
import { DEPARTMENTS, SHIFT_LABELS, WEEK_DAYS, type Shift, type StaffMember } from '@/lib/types';
import { ErrorNote, Field, Toggle, card, inputClass } from './ui';

const blank = (): Omit<StaffMember, 'id'> => ({
  name: '', post: '', department: 'Service', email: '', phone: '', baseSalary: 0, shift: 'full',
  workDays: WEEK_DAYS.slice(0, 5) as unknown as string[], hiredAt: new Date().toISOString().slice(0, 10), active: true, managerScore: 3,
});

export default function StaffManager({ staff, setStaff }: { staff: StaffMember[]; setStaff: (s: StaffMember[]) => void }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(blank());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(s: StaffMember | null) {
    setError('');
    if (s) {
      const { id, ...rest } = s;
      setForm(rest);
      setEditing(id);
    } else {
      setForm(blank());
      setEditing('new');
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing === 'new') {
        const d = await api<{ member: StaffMember }>('/api/staff', { method: 'POST', body: form });
        setStaff([...staff, d.member]);
      } else {
        const d = await api<{ member: StaffMember }>(`/api/staff/${editing}`, { method: 'PUT', body: form });
        setStaff(staff.map((s) => (s.id === editing ? d.member : s)));
      }
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(s: StaffMember) {
    if (!confirm(`Remove ${s.name}? Their reviews are deleted too. Tip: untick “Active” instead to keep history.`)) return;
    try {
      await api(`/api/staff/${s.id}`, { method: 'DELETE' });
      setStaff(staff.filter((x) => x.id !== s.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const byDept = DEPARTMENTS.map((d) => ({ d, people: staff.filter((s) => s.department === d) })).filter((g) => g.people.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {staff.filter((s) => s.active).length} active of {staff.length} team members · monthly base payroll{' '}
          <strong>{money(staff.filter((s) => s.active).reduce((n, s) => n + s.baseSalary, 0))}</strong>
        </p>
        <Button onClick={() => startEdit(null)}>Add staff member</Button>
      </div>

      {editing && (
        <form onSubmit={save} className={`${card} space-y-4`}>
          <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">{editing === 'new' ? 'New staff member' : 'Edit staff member'}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name"><input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required /></Field>
            <Field label="Post / job title"><input className={inputClass} value={form.post} onChange={(e) => set('post', e.target.value)} placeholder="e.g. Sous Chef" required /></Field>
            <Field label="Department">
              <select className={inputClass} value={form.department} onChange={(e) => set('department', e.target.value as StaffMember['department'])}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Email"><input className={inputClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Hire date"><input className={inputClass} type="date" value={form.hiredAt} onChange={(e) => set('hiredAt', e.target.value)} /></Field>
            <Field label="Base monthly salary ($)"><input className={inputClass} type="number" min={0} step="0.01" value={form.baseSalary} onChange={(e) => set('baseSalary', Number(e.target.value))} required /></Field>
            <Field label="Manager score (1–5)" hint="Your own evaluation; counts 40% of the performance score."><input className={inputClass} type="number" min={1} max={5} step="0.1" value={form.managerScore} onChange={(e) => set('managerScore', Number(e.target.value))} required /></Field>
            <Field label="Shift">
              <select className={inputClass} value={form.shift} onChange={(e) => set('shift', e.target.value as Shift)}>
                {(Object.keys(SHIFT_LABELS) as Shift[]).map((k) => <option key={k} value={k}>{SHIFT_LABELS[k]}</option>)}
              </select>
            </Field>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-brand-primary">Working days</legend>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => {
                const on = form.workDays.includes(d);
                return (
                  <button key={d} type="button" aria-pressed={on}
                    onClick={() => set('workDays', on ? form.workDays.filter((x) => x !== d) : [...form.workDays, d])}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-accent dark:bg-zinc-800 dark:text-zinc-300'}`}>
                    {d.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-sm font-semibold text-brand-primary">
            <Toggle checked={form.active} onChange={(v) => set('active', v)} label="Active" /> Active (included in reviews, roster and payroll)
          </label>
          <ErrorNote message={error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}
      {!editing && <ErrorNote message={error} />}

      {byDept.map(({ d, people }) => (
        <section key={d} className={card}>
          <h3 className="text-lg font-semibold text-brand-accent dark:text-brand-light">{d}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr><th className="py-2">Name</th><th>Post</th><th>Shift · days</th><th>Base salary</th><th>Mgr score</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-brand-primary/10 dark:divide-zinc-800">
                {people.map((s) => (
                  <tr key={s.id} className={s.active ? '' : 'opacity-50'}>
                    <td className="py-2.5 font-medium">{s.name}{!s.active && ' (inactive)'}</td>
                    <td>{s.post}</td>
                    <td>{SHIFT_LABELS[s.shift].split(' (')[0]} · {s.workDays.map((x) => x.slice(0, 2)).join(' ') || '–'}</td>
                    <td>{money(s.baseSalary)}</td>
                    <td>{s.managerScore.toFixed(1)}</td>
                    <td className="space-x-2 whitespace-nowrap text-right">
                      <button className="font-semibold text-brand-primary underline" onClick={() => startEdit(s)}>Edit</button>
                      <button className="text-rose-600 underline" onClick={() => remove(s)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
