'use client';
import Button from '@/components/ui/Button';
import type { DayHours } from '@/data/hours';
import type { MenuItem } from '@/data/menu';
import { formatDate } from '@/lib/client';
import { CATEGORY_LABELS, type MessageCategory, type StaffMember, type StaffReview, type Thread } from '@/lib/types';
import { currentMonth, money } from '@/lib/payroll';
import { Stars, StatusBadge, card } from './ui';

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={card}>
      <p className="text-sm font-semibold text-brand-primary">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-brand-accent dark:text-brand-light">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

export default function Overview({
  menu,
  hours,
  threads,
  staff,
  reviews,
  goTo,
}: {
  menu: MenuItem[];
  hours: DayHours[];
  threads: Thread[];
  staff: StaffMember[];
  reviews: StaffReview[];
  goTo: (tab: 'menu' | 'hours' | 'messages' | 'staff' | 'payroll' | 'staffReviews') => void;
}) {
  const available = menu.filter((m) => m.available !== false).length;
  const featured = menu.filter((m) => m.featured).length;
  const unread = threads.filter((t) => t.unreadForAdmin).length;
  const open = threads.filter((t) => t.status === 'open').length;
  const rated = threads.filter((t) => t.rating);
  const avg = rated.length ? rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length : null;

  const activeStaff = staff.filter((s) => s.active);
  const monthReviews = reviews.filter((r) => !r.flagged && r.createdAt.startsWith(currentMonth()));
  const monthAvg = monthReviews.length ? monthReviews.reduce((n, r) => n + r.rating, 0) / monthReviews.length : null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = hours.find((h) => h.day === today);

  const byCategory = (Object.keys(CATEGORY_LABELS) as MessageCategory[]).map((c) => ({
    c,
    n: threads.filter((t) => t.category === c).length,
  }));
  const maxN = Math.max(1, ...byCategory.map((x) => x.n));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Dishes on the menu" value={`${available}/${menu.length}`} sub={`${featured} featured on the home page`} />
        <Stat label="Unread messages" value={unread} sub={`${open} conversations open`} />
        <Stat label="Average rating" value={avg ? avg.toFixed(1) : '–'} sub={rated.length ? `from ${rated.length} rating${rated.length > 1 ? 's' : ''}` : 'no ratings yet'} />
        <Stat
          label={`Today, ${today}`}
          value={todayHours ? (todayHours.closed ? 'Closed' : `${todayHours.open}–${todayHours.close}`) : '–'}
          sub="Edit under Opening hours"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <button className="text-left" onClick={() => goTo('staff')}>
          <Stat label="Active staff" value={activeStaff.length} sub={`Base payroll ${money(activeStaff.reduce((n, s) => n + s.baseSalary, 0))}/month`} />
        </button>
        <button className="text-left" onClick={() => goTo('staffReviews')}>
          <Stat label="Staff rating this month" value={monthAvg ? monthAvg.toFixed(1) : '–'} sub={`${monthReviews.length} customer review${monthReviews.length === 1 ? '' : 's'}`} />
        </button>
        <button className="text-left" onClick={() => goTo('payroll')}>
          <Stat label="Payroll" value="Open" sub="Calculate and pay this month’s salaries" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className={card}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Latest messages</h3>
            <Button variant="outline" className="!px-3 !py-1.5" onClick={() => goTo('messages')}>
              Open inbox
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-brand-primary/10 dark:divide-zinc-800">
            {threads.length === 0 && <li className="py-4 text-sm text-zinc-500">No customer messages yet.</li>}
            {threads.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className={`truncate text-sm ${t.unreadForAdmin ? 'font-bold' : 'font-medium'}`}>{t.subject}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.userName} · {formatDate(t.updatedAt)} {t.rating && <Stars value={t.rating} />}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h3 className="text-xl font-semibold text-brand-accent dark:text-brand-light">Message types</h3>
          <ul className="mt-4 space-y-3">
            {byCategory.map(({ c, n }) => (
              <li key={c}>
                <div className="flex justify-between text-sm">
                  <span>{CATEGORY_LABELS[c]}</span>
                  <span className="font-semibold">{n}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-brand-secondary dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${(n / maxN) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
