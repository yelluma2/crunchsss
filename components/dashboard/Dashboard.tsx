'use client';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/client';
import type { SessionUser } from '@/lib/types';
import AdminPanel from './AdminPanel';
import AuthForm from './AuthForm';
import CustomerPanel from './CustomerPanel';

export default function Dashboard() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ user: SessionUser | null }>('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  async function signOut() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
  }

  if (!ready) return <p className="py-20 text-center text-zinc-500">Loading…</p>;
  if (!user) return <AuthForm onAuthed={setUser} />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-brand-accent dark:text-brand-light">
            {user.role === 'admin' ? 'Restaurant dashboard' : `Hello, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as {user.email} ·{' '}
            <span className="font-semibold capitalize text-brand-primary">{user.role}</span>
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </header>
      {user.role === 'admin' ? <AdminPanel /> : <CustomerPanel />}
    </div>
  );
}
