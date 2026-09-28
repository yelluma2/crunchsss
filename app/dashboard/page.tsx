import type { Metadata } from 'next';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Dashboard />
    </div>
  );
}
