import crypto from 'crypto';
import { ok, fail, readJson, requireAdmin, str } from '@/lib/api';
import { computePay } from '@/lib/payroll';
import { mutate, query } from '@/lib/store';
import type { PayrollRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const month = new URL(req.url).searchParams.get('month');
  const records = await query((db) => db.payroll.filter((p) => !month || p.month === month));
  return ok({ records });
}

// Calculate (or recalculate) the month's payroll for every active staff member.
// Records already marked paid are never touched; manual bonus/deduction/note are kept.
export async function POST(req: Request) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const month = str((await readJson(req))?.month, 7);
  if (!MONTH.test(month)) return fail('Pick a valid month.');

  const records = await mutate((db) => {
    for (const s of db.staff.filter((x) => x.active)) {
      const existing = db.payroll.find((p) => p.month === month && p.staffId === s.id);
      if (existing?.status === 'paid') continue;
      const calc = computePay(s, month, db.staffReviews, { bonus: existing?.bonus, deduction: existing?.deduction });
      const rec: PayrollRecord = {
        id: existing?.id ?? crypto.randomUUID(),
        month,
        staffId: s.id,
        staffName: s.name,
        post: s.post,
        baseSalary: s.baseSalary,
        note: existing?.note ?? '',
        status: 'pending',
        ...calc,
      };
      if (existing) Object.assign(existing, rec);
      else db.payroll.push(rec);
    }
    return db.payroll.filter((p) => p.month === month);
  });
  return ok({ records });
}
