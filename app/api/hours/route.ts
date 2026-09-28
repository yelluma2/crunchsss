import { ok, fail, readJson, requireAdmin } from '@/lib/api';
import { mutate, query } from '@/lib/store';
import { parseHoursInput } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  return ok({ hours: await query((db) => db.hours) });
}

export async function PUT(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const parsed = parseHoursInput(await readJson(req));
  if ('error' in parsed) return fail(parsed.error);
  await mutate((db) => {
    db.hours = parsed.value;
  });
  return ok({ hours: parsed.value });
}
