'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/client';
import type { SessionUser } from '@/lib/types';
import { ErrorNote, Field, card, inputClass } from './ui';

type Portal = 'admin' | 'customer';

const PORTALS: { id: Portal; title: string; blurb: string; icon: string }[] = [
  {
    id: 'admin',
    title: 'Admin portal',
    blurb: 'Manage staff and posts, customer reviews, payroll, the menu and daily operations.',
    icon: '🛠️',
  },
  {
    id: 'customer',
    title: 'Customer portal',
    blurb: 'Review the staff who served you and send messages to the restaurant.',
    icon: '💬',
  },
];

export default function AuthForm({ onAuthed }: { onAuthed: (u: SessionUser) => void }) {
  const [portal, setPortal] = useState<Portal | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function choose(p: Portal | null) {
    setPortal(p);
    setMode('login');
    setError('');
    setPassword('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api<{ user: SessionUser }>(`/api/auth/${mode}`, {
        method: 'POST',
        body: mode === 'register' ? { name, email, password } : { email, password, portal },
      });
      onAuthed(d.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!portal) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-semibold text-brand-accent dark:text-brand-light">Choose your portal</h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Two ways in: one for the people who run Crunch’s, one for our guests.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {PORTALS.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              className={`${card} text-left transition-colors hover:border-brand-primary focus-visible:border-brand-primary`}
            >
              <span aria-hidden="true" className="text-3xl">{p.icon}</span>
              <span className="mt-3 block text-xl font-semibold text-brand-accent dark:text-brand-light">{p.title}</span>
              <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">{p.blurb}</span>
              <span className="mt-4 block text-sm font-semibold text-brand-primary">Continue →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isAdmin = portal === 'admin';

  return (
    <div className={`${card} mx-auto max-w-md`}>
      <button onClick={() => choose(null)} className="text-sm text-zinc-500 underline hover:text-brand-primary">
        ← Change portal
      </button>
      <h1 className="mt-3 text-center text-3xl font-semibold text-brand-accent dark:text-brand-light">
        {isAdmin ? 'Admin sign in' : mode === 'login' ? 'Customer sign in' : 'Create a customer account'}
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {isAdmin
          ? 'Restricted to the restaurant owner and managers.'
          : mode === 'login'
            ? 'Sign in to review our staff and message the team.'
            : 'Sign up to review staff and read our replies.'}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <Field label="Your name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </Field>
        )}
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </Field>
        <Field label="Password" hint={mode === 'register' ? 'At least 8 characters.' : undefined}>
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} required />
        </Field>
        <ErrorNote message={error} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
      {!isAdmin && (
        <p className="mt-5 text-center text-sm">
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            className="font-semibold text-brand-primary underline"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      )}
    </div>
  );
}
