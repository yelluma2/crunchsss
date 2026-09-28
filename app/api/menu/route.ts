import { ok, fail, readJson, requireAdmin } from '@/lib/api';
import { mutate, query } from '@/lib/store';
import { parseMenuInput } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  return ok({ items: await query((db) => db.menu) });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const parsed = parseMenuInput(await readJson(req));
  if ('error' in parsed) return fail(parsed.error);

  const item = await mutate((db) => {
    const id = db.menu.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const created = { id, ...parsed.value };
    db.menu.push(created);
    return created;
  });
  return ok({ item }, 201);
}
