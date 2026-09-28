'use client';
import { useEffect, useState } from 'react';
import type { DayHours } from '@/data/hours';
import type { MenuItem } from '@/data/menu';
import { api } from '@/lib/client';
import type { RestaurantSettings, StaffMember, StaffReview } from '@/lib/types';
import HoursManager from './HoursManager';
import MenuManager from './MenuManager';
import MessagesView from './MessagesView';
import Operations from './Operations';
import Overview from './Overview';
import PayrollManager from './PayrollManager';
import StaffManager from './StaffManager';
import StaffReviewsAdmin from './StaffReviewsAdmin';
import { ErrorNote } from './ui';
import { useThreads } from './useThreads';

type Tab = 'overview' | 'staff' | 'staffReviews' | 'payroll' | 'operations' | 'menu' | 'hours' | 'messages';

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  const [hours, setHours] = useState<DayHours[] | null>(null);
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [error, setError] = useState('');
  const { threads, loading, upsert, remove } = useThreads();

  useEffect(() => {
    Promise.all([
      api<{ items: MenuItem[] }>('/api/menu'),
      api<{ hours: DayHours[] }>('/api/hours'),
      api<{ staff: StaffMember[] }>('/api/staff'),
      api<{ reviews: StaffReview[] }>('/api/staff-reviews'),
      api<{ settings: RestaurantSettings }>('/api/settings'),
    ])
      .then(([m, h, s, r, st]) => {
        setMenu(m.items);
        setHours(h.hours);
        setStaff(s.staff);
        setReviews(r.reviews);
        setSettings(st.settings);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  const unread = threads.filter((t) => t.unreadForAdmin).length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'staff', label: 'Staff & posts' },
    { id: 'staffReviews', label: 'Staff reviews' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'operations', label: 'Operations' },
    { id: 'menu', label: 'Menu' },
    { id: 'hours', label: 'Opening hours' },
    { id: 'messages', label: 'Messages', badge: unread },
  ];

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-2 border-b border-brand-primary/15 pb-3 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-brand-primary text-white'
                : 'text-brand-accent hover:bg-brand-primary/10 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {t.label}
            {!!t.badge && (
              <span className="rounded-full bg-rose-600 px-1.5 text-xs text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <ErrorNote message={error} />

      {tab === 'messages' ? (
        <MessagesView role="admin" threads={threads} loading={loading} upsert={upsert} remove={remove} />
      ) : !menu || !hours || !staff || !settings ? (
        !error && <p className="text-sm text-zinc-500">Loading…</p>
      ) : tab === 'overview' ? (
        <Overview menu={menu} hours={hours} threads={threads} staff={staff} reviews={reviews} goTo={setTab} />
      ) : tab === 'staff' ? (
        <StaffManager staff={staff} setStaff={setStaff} />
      ) : tab === 'staffReviews' ? (
        <StaffReviewsAdmin staff={staff} reviews={reviews} setReviews={setReviews} />
      ) : tab === 'payroll' ? (
        <PayrollManager staff={staff} reviews={reviews} />
      ) : tab === 'operations' ? (
        <Operations staff={staff} hours={hours} settings={settings} setSettings={setSettings} />
      ) : tab === 'menu' ? (
        <MenuManager items={menu} setItems={setMenu} />
      ) : (
        <HoursManager hours={hours} setHours={setHours} />
      )}
    </div>
  );
}
