import { ok } from '@/lib/api';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return ok({ user: await getSession() });
}
