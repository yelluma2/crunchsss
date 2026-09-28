// Types shared by the API routes and the dashboard UI.
export type Role = 'admin' | 'customer';

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export type MessageCategory = 'feedback' | 'compliment' | 'complaint' | 'question';
export type ThreadStatus = 'open' | 'resolved';

export interface ThreadMessage {
  id: string;
  from: 'customer' | 'admin';
  body: string;
  at: string; // ISO date
}

export interface Thread {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: MessageCategory;
  rating?: number; // 1-5, optional
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
  unreadForAdmin: boolean;
  unreadForCustomer: boolean;
  messages: ThreadMessage[];
}

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  feedback: 'General feedback',
  compliment: 'Compliment',
  complaint: 'Complaint',
  question: 'Question',
};

// ---------- staff, staff reviews, payroll, operations ----------
export type Shift = 'morning' | 'evening' | 'full';
export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Morning (7:00–15:00)',
  evening: 'Evening (15:00–23:00)',
  full: 'Full day',
};
export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export interface StaffMember {
  id: string;
  name: string;
  post: string; // job title, e.g. "Head Chef", "Waiter"
  department: 'Kitchen' | 'Service' | 'Management' | 'Bar' | 'Cleaning';
  email: string;
  phone: string;
  baseSalary: number; // monthly
  shift: Shift;
  workDays: string[];
  hiredAt: string; // ISO date
  active: boolean;
  managerScore: number; // 1-5, the manager's own evaluation
}
export const DEPARTMENTS: StaffMember['department'][] = ['Kitchen', 'Service', 'Management', 'Bar', 'Cleaning'];

export interface StaffReview {
  id: string;
  staffId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  flagged: boolean; // admin can exclude a review from pay calculations
}

export type PayStatus = 'pending' | 'paid';
export interface PayrollRecord {
  id: string;
  month: string; // YYYY-MM
  staffId: string;
  staffName: string;
  post: string;
  baseSalary: number;
  customerAvg: number | null;
  reviewCount: number;
  managerScore: number;
  performanceScore: number;
  adjustmentPct: number; // from the performance table
  bonus: number; // manual extra
  deduction: number; // manual deduction
  note: string;
  net: number;
  status: PayStatus;
  paidAt?: string;
}

export interface RestaurantSettings {
  serviceOpen: boolean;
  notice: string;
}
