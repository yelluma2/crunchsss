import { ok, fail, readJson, str, tooManyAttempts } from '@/lib/api';
import { checkAdminCredentials, ADMIN_EMAIL, setSession, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/store';

export async function POST(req: Request) {
  const body = await readJson(req);
  const email = str(body?.email, 120).toLowerCase();
  const password = typeof body?.password === 'string' ? body.password : '';
  const portal = body?.portal === 'admin' ? 'admin' : 'customer';
  const ip = req.headers.get('x-forwarded-for') ?? 'local';

  if (tooManyAttempts(`login:${ip}:${email}`)) {
    return fail('Too many attempts. Try again in a few minutes.', 429);
  }
  if (!email || !password) return fail('Enter your email and password.');

  if (portal === 'admin' && email !== ADMIN_EMAIL) return fail('Incorrect email or password.', 401);
  if (portal === 'customer' && email === ADMIN_EMAIL) {
    return fail('Staff and owners sign in through the Admin portal.', 403);
  }

  if (email === ADMIN_EMAIL) {
    if (!checkAdminCredentials(email, password)) return fail('Incorrect email or password.', 401);
    const admin = { id: 'admin', role: 'admin' as const, name: 'Admin', email: ADMIN_EMAIL };
    await setSession(admin);
    return ok({ user: admin });
  }

  const user = await query((db) => db.users.find((u) => u.email === email));
  if (!user || !verifyPassword(password, user.passHash)) {
    return fail('Incorrect email or password.', 401);
  }
  const session = { id: user.id, role: 'customer' as const, name: user.name, email: user.email };
  await setSession(session);
  return ok({ user: session });
}
