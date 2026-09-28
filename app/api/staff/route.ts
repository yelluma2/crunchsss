import crypto from 'crypto';
import { ok, fail, readJson, requireAdmin, requireUser } from '@/lib/api';
import { mutate, query } from '@/lib/store';
import { parseStaffInput } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// Admin gets everything; customers only get what they need to pick who to review.
export async function GET() {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const staff = await query((db) => db.staff);
  if (g.user.role === 'admin') return ok({ staff });
  return ok({
    staff: staff.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name, post: s.post, department: s.department })),
  });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const parsed = parseStaffInput(await readJson(req));
  if ('error' in parsed) return fail(parsed.error);
  const member = { id: crypto.randomUUID(), ...parsed.value };
  await mutate((db) => {
    db.staff.push(member);
  });
  return ok({ member }, 201);
}
