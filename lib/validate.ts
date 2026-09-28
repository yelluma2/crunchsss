import type { MenuItem } from '@/data/menu';
import type { DayHours } from '@/data/hours';
import { str } from '@/lib/api';
import { DEPARTMENTS, WEEK_DAYS, type Shift, type StaffMember } from '@/lib/types';

const CATEGORIES = ['starter', 'main', 'dessert', 'drink'] as const;

export function parseMenuInput(
  body: Record<string, unknown> | null,
): { value: Omit<MenuItem, 'id'> } | { error: string } {
  if (!body) return { error: 'Invalid request.' };
  const name = str(body.name, 80);
  const description = str(body.description, 300);
  const price = Number(body.price);
  const category = body.category as MenuItem['category'];
  const image = str(body.image, 200);

  if (!name) return { error: 'Name is required.' };
  if (!description) return { error: 'Description is required.' };
  if (!Number.isFinite(price) || price < 0 || price > 10000) return { error: 'Enter a valid price.' };
  if (!CATEGORIES.includes(category)) return { error: 'Pick a category.' };
  // only local images (or https URLs) so nothing odd ends up in <Image src>
  if (image && !image.startsWith('/images/')) {
    return { error: 'Image must be a file in public/images, e.g. /images/salmon.jpg' };
  }

  return {
    value: {
      name,
      description,
      price: Math.round(price * 100) / 100,
      category,
      image: image || undefined,
      available: body.available !== false,
      featured: body.featured === true,
    },
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseHoursInput(body: Record<string, unknown> | null): { value: DayHours[] } | { error: string } {
  const list = body?.hours;
  if (!Array.isArray(list) || list.length !== 7) return { error: 'Expected 7 days.' };
  const out: DayHours[] = [];
  for (const row of list) {
    const day = str(row?.day, 12);
    const open = str(row?.open, 5);
    const close = str(row?.close, 5);
    const closed = row?.closed === true;
    if (!day) return { error: 'Invalid day.' };
    if (!closed && (!TIME.test(open) || !TIME.test(close))) {
      return { error: `Enter valid times for ${day}.` };
    }
    out.push({ day, open: open || '00:00', close: close || '00:00', ...(closed ? { closed: true } : {}) });
  }
  return { value: out };
}


export function parseStaffInput(
  body: Record<string, unknown> | null,
): { value: Omit<StaffMember, 'id'> } | { error: string } {
  if (!body) return { error: 'Invalid request.' };
  const name = str(body.name, 80);
  const post = str(body.post, 60);
  const email = str(body.email, 120);
  const baseSalary = Number(body.baseSalary);
  const managerScore = Number(body.managerScore);
  const department = body.department as StaffMember['department'];
  const shift = body.shift as Shift;
  const hiredAt = str(body.hiredAt, 10);
  const workDays = Array.isArray(body.workDays)
    ? WEEK_DAYS.filter((d) => (body.workDays as unknown[]).includes(d))
    : [];

  if (!name) return { error: 'Name is required.' };
  if (!post) return { error: 'Job post / title is required.' };
  if (!DEPARTMENTS.includes(department)) return { error: 'Pick a department.' };
  if (!['morning', 'evening', 'full'].includes(shift)) return { error: 'Pick a shift.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email.' };
  if (!Number.isFinite(baseSalary) || baseSalary < 0 || baseSalary > 1_000_000) return { error: 'Enter a valid monthly salary.' };
  if (!Number.isFinite(managerScore) || managerScore < 1 || managerScore > 5) return { error: 'Manager score must be 1 to 5.' };
  if (hiredAt && !/^\d{4}-\d{2}-\d{2}$/.test(hiredAt)) return { error: 'Enter a valid hire date.' };

  return {
    value: {
      name,
      post,
      department,
      email,
      phone: str(body.phone, 30),
      baseSalary: Math.round(baseSalary * 100) / 100,
      shift,
      workDays,
      hiredAt: hiredAt || new Date().toISOString().slice(0, 10),
      active: body.active !== false,
      managerScore: Math.round(managerScore * 10) / 10,
    },
  };
}
