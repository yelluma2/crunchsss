import { ok, readJson, requireAdmin, str } from '@/lib/api';
import { mutate, query } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  return ok({ settings: await query((db) => db.settings) });
}

export async function PUT(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const body = await readJson(req);
  const settings = await mutate((db) => {
    db.settings = { serviceOpen: body?.serviceOpen !== false, notice: str(body?.notice, 200) };
    return db.settings;
  });
  return ok({ settings });
}
