import crypto from 'crypto';
import { ok, fail, readJson, requireAdmin, requireUser, str } from '@/lib/api';
import { mutate, query } from '@/lib/store';
import type { StaffReview } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  const reviews = await query((db) =>
    db.staffReviews
      .filter((r) => user.role === 'admin' || r.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  return ok({ reviews });
}

// Customers review a staff member (one review per person per staff member per day).
export async function POST(req: Request) {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  if (user.role !== 'customer') return fail('Only customers can review staff.', 403);

  const body = await readJson(req);
  const staffId = str(body?.staffId, 80);
  const comment = str(body?.comment, 600);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail('Pick a rating from 1 to 5.');
  if (comment.length < 3) return fail('Please add a short comment.');

  const result = await mutate((db) => {
    const member = db.staff.find((s) => s.id === staffId && s.active);
    if (!member) return { error: 'Staff member not found.' } as const;
    const today = new Date().toISOString().slice(0, 10);
    if (db.staffReviews.some((r) => r.userId === user.id && r.staffId === staffId && r.createdAt.startsWith(today))) {
      return { error: 'You already reviewed this person today.' } as const;
    }
    const review: StaffReview = {
      id: crypto.randomUUID(),
      staffId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      flagged: false,
    };
    db.staffReviews.push(review);
    return { review } as const;
  });
  return 'error' in result ? fail(result.error) : ok({ review: result.review }, 201);
}
