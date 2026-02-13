import { supabase } from '../supabase';
import type { Member } from '../supabase';

export const dashboardQueryKey = ['dashboard'] as const;

export async function fetchDashboardStats(): Promise<{
  totalMembers: number;
  activeCount: number;
  inactiveCount: number;
  idCreatedCount: number;
  totalRevenue: number;
  completedPaymentsCount: number;
}> {
  const [membersRes, paymentsRes] = await Promise.all([
    supabase.from('members').select('id, status, id_card_created'),
    supabase.from('payments').select('amount').eq('status', 'Completed'),
  ]);
  if (membersRes.error) throw membersRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  const members = (membersRes.data ?? []) as { id: string; status: string; id_card_created: boolean }[];
  const totalMembers = members.length;
  const activeCount = members.filter((m) => m.status === 'Active').length;
  const inactiveCount = members.filter((m) => m.status === 'Inactive').length;
  const idCreatedCount = members.filter((m) => m.id_card_created === true).length;
  const totalRevenue = (paymentsRes.data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  return {
    totalMembers,
    activeCount,
    inactiveCount,
    idCreatedCount,
    totalRevenue,
    completedPaymentsCount: (paymentsRes.data ?? []).length,
  };
}

export async function fetchRecentMembers(limit: number = 10): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function fetchExpensesForChart(): Promise<{ amount: number; category: string; date: string }[]> {
  const { data, error } = await supabase.from('expenses').select('amount, category, date').order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as { amount: number; category: string; date: string }[];
}
