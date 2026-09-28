import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { Role, SessionUser } from '@/lib/types';

const COOKIE = 'crunchs_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const isProd = process.env.NODE_ENV === 'production';

// Set AUTH_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local (see README).
// The fallbacks only exist so `npm run dev` works out of the box.
const SECRET = process.env.AUTH_SECRET || (isProd ? '' : 'dev-only-secret-change-me');
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@crunchs.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin123');

// ---------- passwords ----------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, 'hex');
  return attempt.length === real.length && crypto.timingSafeEqual(attempt, real);
}

export function checkAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_PASSWORD) return false; // production without ADMIN_PASSWORD = admin login disabled
  if (email.toLowerCase() !== ADMIN_EMAIL) return false;
  const a = crypto.createHash('sha256').update(password).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

// ---------- signed session cookie ----------
function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

function encode(user: SessionUser): string {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): SessionUser | null {
  if (!SECRET) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (data.role !== 'admin' && data.role !== 'customer') return null;
    return { id: data.id, role: data.role as Role, name: data.name, email: data.email };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  if (!SECRET) throw new Error('AUTH_SECRET is not set');
  (await cookies()).set(COOKIE, encode(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? decode(token) : null;
}
