'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/client';
import type { Thread } from '@/lib/types';

// Loads conversations and re-checks every 15s so new messages appear without a refresh.
export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await api<{ threads: Thread[] }>('/api/messages');
      setThreads(d.threads);
    } catch {
      /* keep what we have; the next poll will retry */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const upsert = useCallback((t: Thread) => {
    setThreads((prev) => {
      const rest = prev.filter((x) => x.id !== t.id);
      return [t, ...rest].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const remove = useCallback((id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { threads, loading, refresh, upsert, remove };
}
