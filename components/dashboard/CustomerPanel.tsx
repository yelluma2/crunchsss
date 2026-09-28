'use client';
import { useState } from 'react';
import MessagesView from './MessagesView';
import StaffReviewForm from './StaffReviewForm';
import { useThreads } from './useThreads';

export default function CustomerPanel() {
  const { threads, loading, upsert, remove } = useThreads();
  const [tab, setTab] = useState<'review' | 'messages'>('review');
  const unread = threads.filter((t) => t.unreadForCustomer).length;

  const tabs = [
    { id: 'review' as const, label: 'Review our staff' },
    { id: 'messages' as const, label: 'Messages', badge: unread },
  ];

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Customer sections" className="flex flex-wrap gap-2 border-b border-brand-primary/15 pb-3 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-brand-primary text-white' : 'text-brand-accent hover:bg-brand-primary/10 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {t.label}
            {!!t.badge && <span className="rounded-full bg-rose-600 px-1.5 text-xs text-white">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'review' ? (
        <StaffReviewForm />
      ) : (
        <>
          <p className="text-zinc-600 dark:text-zinc-400">
            Ask a question or leave a comment. The team replies right here
            {unread > 0 && <strong className="text-brand-primary"> — you have {unread} new repl{unread > 1 ? 'ies' : 'y'}.</strong>}
          </p>
          <MessagesView role="customer" threads={threads} loading={loading} upsert={upsert} remove={remove} />
        </>
      )}
    </div>
  );
}
