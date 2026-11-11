import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { AdminStats } from '@/lib/types/database';

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard_stats').single<AdminStats>();
  if (error) throw error;
  return data;
}
