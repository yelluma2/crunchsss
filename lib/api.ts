import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import type { SessionUser } from '@/lib/types';

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

type Guard = { user: SessionUser } | { error: NextResponse };

export async function requireUser(): Promise<Guard> {
  const user = await getSession();
  return user ? { user } : { error: fail('Please sign in.', 401) };
}

export async function requireAdmin(): Promise<Guard> {
  const g = await requireUser();
  if ('error' in g) return g;
  return g.user.role === 'admin' ? g : { error: fail('Admins only.', 403) };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

// Very small in-memory limiter to slow down password guessing.
const hits = new Map<string, { n: number; reset: number }>();
export function tooManyAttempts(key: string, limit = 10, windowMs = 15 * 60_000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  h.n += 1;
  return h.n > limit;
}
