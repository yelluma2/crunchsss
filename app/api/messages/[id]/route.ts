import crypto from 'crypto';
import { ok, fail, readJson, requireAdmin, requireUser, str } from '@/lib/api';
import { mutate } from '@/lib/store';
import type { SessionUser, Thread } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

const canSee = (user: SessionUser, t: Thread) => user.role === 'admin' || t.userId === user.id;

// Open a conversation; marks it as read for whoever opened it.
export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  const id = (await params).id;

  const thread = await mutate((db) => {
    const t = db.threads.find((x) => x.id === id);
    if (!t || !canSee(user, t)) return null;
    if (user.role === 'admin') t.unreadForAdmin = false;
    else t.unreadForCustomer = false;
    return t;
  });
  return thread ? ok({ thread }) : fail('Conversation not found.', 404);
}

// Reply (admin or the customer who owns the thread).
export async function POST(req: Request, { params }: Ctx) {
  const g = await requireUser();
  if ('error' in g) return g.error;
  const { user } = g;
  const id = (await params).id;
  const text = str((await readJson(req))?.body, 2000);
  if (!text) return fail('Write a message first.');

  const thread = await mutate((db) => {
    const t = db.threads.find((x) => x.id === id);
    if (!t || !canSee(user, t)) return null;
    const now = new Date().toISOString();
    const from = user.role === 'admin' ? 'admin' : 'customer';
    t.messages.push({ id: crypto.randomUUID(), from, body: text, at: now });
    t.updatedAt = now;
    if (from === 'admin') {
      t.unreadForCustomer = true;
    } else {
      t.unreadForAdmin = true;
      t.status = 'open'; // a customer reply reopens a resolved thread
    }
    return t;
  });
  return thread ? ok({ thread }) : fail('Conversation not found.', 404);
}

// Admin: mark resolved / reopen.
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const status = (await readJson(req))?.status;
  if (status !== 'open' && status !== 'resolved') return fail('Invalid status.');
  const thread = await mutate((db) => {
    const t = db.threads.find((x) => x.id === id);
    if (t) t.status = status;
    return t ?? null;
  });
  return thread ? ok({ thread }) : fail('Conversation not found.', 404);
}

// Admin: delete a conversation.
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const removed = await mutate((db) => {
    const before = db.threads.length;
    db.threads = db.threads.filter((t) => t.id !== id);
    return db.threads.length < before;
  });
  return removed ? ok({ ok: true }) : fail('Conversation not found.', 404);
}
