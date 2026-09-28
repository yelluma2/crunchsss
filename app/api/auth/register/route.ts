import crypto from 'crypto';
import { ok, fail, readJson, str, tooManyAttempts } from '@/lib/api';
import { ADMIN_EMAIL, hashPassword, setSession } from '@/lib/auth';
import { mutate } from '@/lib/store';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (tooManyAttempts(`register:${ip}`, 10)) return fail('Too many attempts. Try again later.', 429);

  const body = await readJson(req);
  const name = str(body?.name, 60);
  const email = str(body?.email, 120).toLowerCase();
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!name) return fail('Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email.');
  if (password.length < 8) return fail('Password must be at least 8 characters.');
  if (email === ADMIN_EMAIL) return fail('That email is reserved.');

  const user = await mutate((db) => {
    if (db.users.some((u) => u.email === email)) return null;
    const u = {
      id: crypto.randomUUID(),
      name,
      email,
      passHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(u);
    return u;
  });
  if (!user) return fail('An account with that email already exists.', 409);

  const session = { id: user.id, role: 'customer' as const, name: user.name, email: user.email };
  await setSession(session);
  return ok({ user: session }, 201);
}
