'use client';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { api, formatDate } from '@/lib/client';
import { CATEGORY_LABELS, type MessageCategory, type Thread } from '@/lib/types';
import { ErrorNote, Field, StarPicker, Stars, StatusBadge, card, inputClass } from './ui';

interface Props {
  role: 'admin' | 'customer';
  threads: Thread[];
  loading: boolean;
  upsert: (t: Thread) => void;
  remove: (id: string) => void;
  initialSelectedId?: string | null;
}

type Filter = 'all' | 'unread' | 'open' | 'resolved';

export default function MessagesView({ role, threads, loading, upsert, remove, initialSelectedId = null }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const unreadOf = (t: Thread) => (role === 'admin' ? t.unreadForAdmin : t.unreadForCustomer);
  const visible = threads.filter((t) => {
    if (filter === 'unread') return unreadOf(t);
    if (filter === 'open' || filter === 'resolved') return t.status === filter;
    return true;
  });
  const selected = threads.find((t) => t.id === selectedId) ?? null;

  // Opening a conversation marks it as read on the server
  async function open(t: Thread) {
    setComposing(false);
    setSelectedId(t.id);
    if (unreadOf(t)) {
      try {
        const d = await api<{ thread: Thread }>(`/api/messages/${t.id}`);
        upsert(d.thread);
      } catch {
        /* non-fatal */
      }
    }
  }

  const filters: Filter[] = role === 'admin' ? ['all', 'unread', 'open', 'resolved'] : ['all', 'unread'];

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section className={`${card} flex max-h-[70vh] flex-col p-0`} aria-label="Conversations">
        <div className="flex items-center justify-between gap-2 border-b border-brand-primary/15 p-4 dark:border-zinc-800">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  filter === f
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-secondary text-brand-accent dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {role === 'customer' && (
            <Button
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => {
                setComposing(true);
                setSelectedId(null);
              }}
            >
              New message
            </Button>
          )}
        </div>

        <ul className="flex-1 divide-y divide-brand-primary/10 overflow-y-auto dark:divide-zinc-800">
          {loading && <li className="p-4 text-sm text-zinc-500">Loading…</li>}
          {!loading && visible.length === 0 && (
            <li className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {role === 'admin' ? 'No messages here yet.' : 'You haven’t sent anything yet. Tell us how we did!'}
            </li>
          )}
          {visible.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <li key={t.id}>
                <button
                  onClick={() => open(t)}
                  className={`block w-full px-4 py-3 text-left hover:bg-brand-secondary/60 dark:hover:bg-zinc-800 ${
                    t.id === selectedId ? 'bg-brand-secondary dark:bg-zinc-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      {unreadOf(t) && (
                        <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                      )}
                      <span className={`truncate text-sm ${unreadOf(t) ? 'font-bold' : 'font-medium'}`}>
                        {t.subject}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">{formatDate(t.updatedAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {role === 'admin' && <span className="font-medium">{t.userName}</span>}
                    <span>{CATEGORY_LABELS[t.category]}</span>
                    {t.rating && <Stars value={t.rating} />}
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {last.from === 'admin' && role === 'customer' ? 'Crunch’s: ' : ''}
                    {last.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={card} aria-live="polite">
        {composing && role === 'customer' ? (
          <ComposeForm
            onSent={(t) => {
              upsert(t);
              setComposing(false);
              setSelectedId(t.id);
            }}
            onCancel={() => setComposing(false)}
          />
        ) : selected ? (
          <ThreadPanel
            key={selected.id}
            thread={selected}
            role={role}
            onChange={upsert}
            onDeleted={() => {
              remove(selected.id);
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="grid h-full min-h-48 place-items-center text-center text-sm text-zinc-500 dark:text-zinc-400">
            {role === 'admin' ? (
              'Select a conversation to read and reply.'
            ) : (
              <div>
                <p>Select a conversation, or start a new one.</p>
                <Button className="mt-4" onClick={() => setComposing(true)}>
                  Send feedback
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ComposeForm({ onSent, onCancel }: { onSent: (t: Thread) => void; onCancel: () => void }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<MessageCategory>('feedback');
  const [rating, setRating] = useState<number | undefined>();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api<{ thread: Thread }>('/api/messages', {
        method: 'POST',
        body: { subject, category, rating, body },
      });
      onSent(d.thread);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-brand-accent dark:text-brand-light">Message the restaurant</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject">
          <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} placeholder="e.g. Loved the short rib" required />
        </Field>
        <Field label="Type">
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as MessageCategory)}>
            {(Object.keys(CATEGORY_LABELS) as MessageCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div>
        <span className="mb-1 block text-sm font-semibold text-brand-primary">Rate your visit (optional)</span>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <Field label="Your message">
        <textarea className={`${inputClass} min-h-32`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
      </Field>
      <ErrorNote message={error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send to the team'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ThreadPanel({
  thread,
  role,
  onChange,
  onDeleted,
}: {
  thread: Thread;
  role: 'admin' | 'customer';
  onChange: (t: Thread) => void;
  onDeleted: () => void;
}) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [thread.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    setError('');
    try {
      const d = await api<{ thread: Thread }>(`/api/messages/${thread.id}`, { method: 'POST', body: { body: reply } });
      onChange(d.thread);
      setReply('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: 'open' | 'resolved') {
    try {
      const d = await api<{ thread: Thread }>(`/api/messages/${thread.id}`, { method: 'PATCH', body: { status } });
      onChange(d.thread);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function del() {
    if (!confirm('Delete this conversation permanently?')) return;
    try {
      await api(`/api/messages/${thread.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-primary/15 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-semibold text-brand-accent dark:text-brand-light">{thread.subject}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {role === 'admin' && (
              <span>
                {thread.userName} ·{' '}
                <a className="underline hover:text-brand-primary" href={`mailto:${thread.userEmail}`}>
                  {thread.userEmail}
                </a>
              </span>
            )}
            <span>{CATEGORY_LABELS[thread.category]}</span>
            {thread.rating && <Stars value={thread.rating} />}
            <StatusBadge status={thread.status} />
          </p>
        </div>
        {role === 'admin' && (
          <div className="flex gap-2">
            <Button variant="outline" className="!px-3 !py-1.5" onClick={() => setStatus(thread.status === 'open' ? 'resolved' : 'open')}>
              {thread.status === 'open' ? 'Mark resolved' : 'Reopen'}
            </Button>
            <Button variant="outline" className="!px-3 !py-1.5" onClick={del}>
              Delete
            </Button>
          </div>
        )}
      </header>

      <ul className="my-4 max-h-[42vh] space-y-3 overflow-y-auto pr-1">
        {thread.messages.map((m) => {
          const mine = m.from === role;
          return (
            <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  mine
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-secondary text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? 'text-white/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {m.from === 'admin' ? 'Crunch’s team' : role === 'admin' ? thread.userName : 'You'} · {formatDate(m.at)}
                </p>
              </div>
            </li>
          );
        })}
        <li ref={endRef} aria-hidden="true" />
      </ul>

      <form onSubmit={send} className="space-y-3">
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder={role === 'admin' ? 'Write a reply to the customer…' : 'Add a follow-up message…'}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          maxLength={2000}
          aria-label="Reply"
        />
        <ErrorNote message={error} />
        <Button type="submit" disabled={busy || !reply.trim()}>
          {busy ? 'Sending…' : role === 'admin' ? 'Send reply' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
