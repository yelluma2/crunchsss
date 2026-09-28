import crypto from 'crypto';
import { ok, fail, readJson, requireUser, str } from '@/lib/api';
import { mutate, query } from '@/lib/store';
import type { MessageCategory, Thread } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CATEGORIES: MessageCategory[] = ['feedback', 'compliment', 'complaint', 'question'];

// Admin: every conversation. Customer: only their own.
export async function GET() {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  const threads = await query((db) =>
    db.threads
      .filter((t) => user.role === 'admin' || t.userId === user.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
  return ok({ threads });
}

// Customers start a new conversation with the restaurant.
export async function POST(req: Request) {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  if (user.role !== 'customer') return fail('Only customers can send feedback.', 403);

  const body = await readJson(req);
  const subject = str(body?.subject, 100);
  const text = str(body?.body, 2000);
  const category = body?.category as MessageCategory;
  const rating = body?.rating == null || body.rating === '' ? undefined : Number(body.rating);

  if (!subject) return fail('Please add a subject.');
  if (text.length < 5) return fail('Please write a little more.');
  if (!CATEGORIES.includes(category)) return fail('Pick a category.');
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return fail('Rating must be 1 to 5.');
  }

  const now = new Date().toISOString();
  const thread: Thread = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    subject,
    category,
    rating,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    unreadForAdmin: true,
    unreadForCustomer: false,
    messages: [{ id: crypto.randomUUID(), from: 'customer', body: text, at: now }],
  };
  await mutate((db) => {
    db.threads.push(thread);
  });
  return ok({ thread }, 201);
}
