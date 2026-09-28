import { ok, fail, readJson, requireAdmin } from '@/lib/api';
import { mutate } from '@/lib/store';

type Ctx = { params: Promise<{ id: string }> };

// Admin: exclude / include a review in pay calculations (e.g. abusive or fake review).
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const flagged = (await readJson(req))?.flagged === true;
  const review = await mutate((db) => {
    const r = db.staffReviews.find((x) => x.id === id);
    if (r) r.flagged = flagged;
    return r ?? null;
  });
  return review ? ok({ review }) : fail('Review not found.', 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const removed = await mutate((db) => {
    const before = db.staffReviews.length;
    db.staffReviews = db.staffReviews.filter((r) => r.id !== id);
    return db.staffReviews.length < before;
  });
  return removed ? ok({ ok: true }) : fail('Review not found.', 404);
}
