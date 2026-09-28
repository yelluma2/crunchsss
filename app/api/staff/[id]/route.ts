import { ok, fail, readJson, requireAdmin } from '@/lib/api';
import { mutate } from '@/lib/store';
import { parseStaffInput } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const parsed = parseStaffInput(await readJson(req));
  if ('error' in parsed) return fail(parsed.error);
  const member = await mutate((db) => {
    const i = db.staff.findIndex((s) => s.id === id);
    if (i < 0) return null;
    db.staff[i] = { id, ...parsed.value };
    return db.staff[i];
  });
  return member ? ok({ member }) : fail('Staff member not found.', 404);
}

// Removes the person and their reviews. Past payroll records are kept for the books.
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const removed = await mutate((db) => {
    const before = db.staff.length;
    db.staff = db.staff.filter((s) => s.id !== id);
    db.staffReviews = db.staffReviews.filter((r) => r.staffId !== id);
    db.payroll = db.payroll.filter((p) => p.staffId !== id || p.status === 'paid');
    return db.staff.length < before;
  });
  return removed ? ok({ ok: true }) : fail('Staff member not found.', 404);
}
