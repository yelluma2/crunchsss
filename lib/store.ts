// Tiny JSON-file database. Fine for a single restaurant on a single server
// (local machine, VPS, Railway/Render with a disk). On Vercel the filesystem
// is read-only, so swap the readDb/writeDb functions for a hosted database
// (Vercel Postgres, Supabase, Turso...). Everything else keeps working.
import { promises as fs } from 'fs';
import path from 'path';
import { menuItems, type MenuItem } from '@/data/menu';
import { openingHours, type DayHours } from '@/data/hours';
import type { PayrollRecord, RestaurantSettings, StaffMember, StaffReview, Thread } from '@/lib/types';
import { team } from '@/data/site';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passHash: string;
  createdAt: string;
}

interface Db {
  menu: MenuItem[];
  hours: DayHours[];
  users: UserRecord[];
  threads: Thread[];
  staff: StaffMember[];
  staffReviews: StaffReview[];
  payroll: PayrollRecord[];
  settings: RestaurantSettings;
}

const DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const FILE = path.join(DIR, 'db.json');
const FEATURED_SEED = new Set([4, 5, 1]);

const ALL_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SALARY_SEED: Record<string, number> = {
  'Head Chef & Co-founder': 4500,
  'General Manager & Co-founder': 4500,
  'Pastry Chef': 3000,
};

function seedStaff(): StaffMember[] {
  const dept = (role: string): StaffMember['department'] =>
    /manager/i.test(role) ? 'Management' : 'Kitchen';
  const base = team.map((t, i) => ({
    id: `staff-${i + 1}`,
    name: t.name,
    post: t.role,
    department: dept(t.role),
    email: `${t.name.split(' ')[0].toLowerCase()}@crunchs.com`,
    phone: '',
    baseSalary: SALARY_SEED[t.role] ?? 2500,
    shift: 'full' as const,
    workDays: ALL_WEEK.slice(0, 6),
    hiredAt: '2014-06-01',
    active: true,
    managerScore: 4,
  }));
  return [
    ...base,
    { id: 'staff-w1', name: 'Amara Bello', post: 'Waiter', department: 'Service', email: 'amara@crunchs.com', phone: '', baseSalary: 1800, shift: 'evening', workDays: ALL_WEEK.slice(1, 7), hiredAt: '2021-03-15', active: true, managerScore: 4 },
    { id: 'staff-w2', name: 'Tobias Klein', post: 'Waiter', department: 'Service', email: 'tobias@crunchs.com', phone: '', baseSalary: 1800, shift: 'morning', workDays: ALL_WEEK.slice(0, 5), hiredAt: '2022-09-01', active: true, managerScore: 3 },
    { id: 'staff-b1', name: 'Lena Fischer', post: 'Barista', department: 'Bar', email: 'lena@crunchs.com', phone: '', baseSalary: 1900, shift: 'morning', workDays: ALL_WEEK.slice(0, 6), hiredAt: '2020-01-20', active: true, managerScore: 4 },
  ];
}

function seed(): Db {
  return {
    menu: menuItems.map((m) => ({
      ...m,
      available: true,
      featured: FEATURED_SEED.has(m.id),
    })),
    hours: openingHours.map((h) => ({ ...h })),
    users: [],
    threads: [],
    staff: seedStaff(),
    staffReviews: [],
    payroll: [],
    settings: { serviceOpen: true, notice: '' },
  };
}

async function readDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const db = JSON.parse(raw) as Partial<Db>;
    // older db.json files won't have the staff/payroll collections yet
    const fresh = seed();
    return {
      ...fresh,
      ...db,
      staff: db.staff ?? fresh.staff,
      staffReviews: db.staffReviews ?? [],
      payroll: db.payroll ?? [],
      settings: db.settings ?? fresh.settings,
    } as Db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    const fresh = seed();
    await writeDb(fresh);
    return fresh;
  }
}

async function writeDb(db: Db) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE); // atomic swap so a crash never leaves half a file
}

// Serialises all writes so two requests can't overwrite each other.
let lock: Promise<unknown> = Promise.resolve();

export function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = lock.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  lock = run.catch(() => undefined);
  return run;
}

export async function query<T>(fn: (db: Db) => T): Promise<T> {
  await lock;
  return fn(await readDb());
}

// Convenience readers used by the public pages
export const getMenu = () => query((db) => db.menu);
export const getHours = () => query((db) => db.hours);
