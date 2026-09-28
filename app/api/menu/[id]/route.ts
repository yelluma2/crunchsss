import { ok, fail, readJson, requireAdmin } from '@/lib/api';
import { mutate } from '@/lib/store';
import { parseMenuInput } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = Number((await params).id);
  const parsed = parseMenuInput(await readJson(req));
  if ('error' in parsed) return fail(parsed.error);

  const item = await mutate((db) => {
    const i = db.menu.findIndex((m) => m.id === id);
    if (i === -1) return null;
    db.menu[i] = { id, ...parsed.value };
    return db.menu[i];
  });
  return item ? ok({ item }) : fail('Dish not found.', 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = Number((await params).id);
  const removed = await mutate((db) => {
    const before = db.menu.length;
    db.menu = db.menu.filter((m) => m.id !== id);
    return db.menu.length < before;
  });
  return removed ? ok({ ok: true }) : fail('Dish not found.', 404);
}
