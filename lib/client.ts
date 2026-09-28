// Small fetch wrapper for the dashboard: JSON in, JSON out, throws readable errors.
export async function api<T = unknown>(
  url: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(url, {
    method: init.method ?? 'GET',
    headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Something went wrong.');
  return data as T;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
