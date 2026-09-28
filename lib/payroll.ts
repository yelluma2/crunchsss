// Pay rules in one place, used by the API (to save) and the UI (to explain).
// Performance score = 60% customer reviews + 40% manager score (manager score alone if no reviews that month).
import type { PayrollRecord, StaffMember, StaffReview } from '@/lib/types';

export const REVIEW_WEIGHT = 0.6;

// Highest matching row wins.
export const PAY_BANDS: { min: number; pct: number; label: string }[] = [
  { min: 4.5, pct: 15, label: 'Outstanding' },
  { min: 4.0, pct: 8, label: 'Very good' },
  { min: 3.5, pct: 0, label: 'Meets expectations' },
  { min: 3.0, pct: -5, label: 'Needs improvement' },
  { min: 0, pct: -10, label: 'Poor' },
];

export const bandFor = (score: number) => PAY_BANDS.find((b) => score >= b.min) ?? PAY_BANDS[PAY_BANDS.length - 1];
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const currentMonth = () => new Date().toISOString().slice(0, 7);

export function reviewsFor(staffId: string, month: string, reviews: StaffReview[]) {
  return reviews.filter((r) => r.staffId === staffId && !r.flagged && r.createdAt.startsWith(month));
}

export function computePay(
  staff: StaffMember,
  month: string,
  reviews: StaffReview[],
  extras: { bonus?: number; deduction?: number } = {},
) {
  const rs = reviewsFor(staff.id, month, reviews);
  const customerAvg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : null;
  const performanceScore = round2(
    customerAvg === null ? staff.managerScore : customerAvg * REVIEW_WEIGHT + staff.managerScore * (1 - REVIEW_WEIGHT),
  );
  const adjustmentPct = bandFor(performanceScore).pct;
  const bonus = extras.bonus ?? 0;
  const deduction = extras.deduction ?? 0;
  const net = round2(Math.max(0, staff.baseSalary * (1 + adjustmentPct / 100) + bonus - deduction));
  return {
    customerAvg: customerAvg === null ? null : round2(customerAvg),
    reviewCount: rs.length,
    managerScore: staff.managerScore,
    performanceScore,
    adjustmentPct,
    bonus,
    deduction,
    net,
  } satisfies Partial<PayrollRecord>;
}
