import { ok, fail, readJson, requireAdmin, str } from '@/lib/api';
import { round2 } from '@/lib/payroll';
import { mutate } from '@/lib/store';

type Ctx = { params: Promise<{ id: string }> };

// Admin: adjust bonus / deduction / note on a pending record, or mark it paid / pending.
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if ('error' in g) return g.error;
  const id = (await params).id;
  const body = await readJson(req);

  const result = await mutate((db) => {
    const p = db.payroll.find((x) => x.id === id);
    if (!p) return { error: 'Record not found.', code: 404 } as const;

    if (body?.status === 'paid' || body?.status === 'pending') {
      p.status = body.status;
      p.paidAt = body.status === 'paid' ? new Date().toISOString() : undefined;
    } else {
      if (p.status === 'paid') return { error: 'Reopen this record before editing a paid salary.', code: 400 } as const;
      const bonus = Number(body?.bonus ?? p.bonus);
      const deduction = Number(body?.deduction ?? p.deduction);
      if (![bonus, deduction].every((n) => Number.isFinite(n) && n >= 0 && n <= 1_000_000)) {
        return { error: 'Enter valid amounts.', code: 400 } as const;
      }
      p.bonus = round2(bonus);
      p.deduction = round2(deduction);
      if (body?.note !== undefined) p.note = str(body.note, 200);
      p.net = round2(Math.max(0, p.baseSalary * (1 + p.adjustmentPct / 100) + p.bonus - p.deduction));
    }
    return { record: p } as const;
  });
  return 'error' in result ? fail(result.error, result.code) : ok({ record: result.record });
}
