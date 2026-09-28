'use client';
import type { ThreadStatus } from '@/lib/types';

export const card =
  'rounded-lg border border-brand-primary/15 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

export const inputClass =
  'w-full rounded-md border border-brand-primary/30 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-primary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {message}
    </p>
  );
}

export function StatusBadge({ status }: { status: ThreadStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        status === 'open'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      }`}
    >
      {status === 'open' ? 'Open' : 'Resolved'}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="text-brand-primary">
      {'★'.repeat(value)}
      <span className="text-zinc-300 dark:text-zinc-600">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(value === n ? undefined : n)}
          className={`text-2xl leading-none ${
            value !== undefined && n <= value ? 'text-brand-primary' : 'text-zinc-300 dark:text-zinc-600'
          }`}
        >
          ★
        </button>
      ))}
      {value !== undefined && (
        <button type="button" onClick={() => onChange(undefined)} className="ml-2 text-xs text-zinc-500 underline">
          clear
        </button>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-brand-primary' : 'bg-zinc-300 dark:bg-zinc-600'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
