import { supabase } from '../supabase';
import type { Payment } from '../supabase';

export const paymentsQueryKey = (memberId: string) => ['members', memberId, 'payments'] as const;

export async function fetchPaymentsByMemberId(memberId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function fetchPaymentsSummary(): Promise<{ totalRevenue: number; completedCount: number }> {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('status', 'Completed');
  if (error) throw error;
  const totalRevenue = (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  return { totalRevenue, completedCount: (data ?? []).length };
}

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'member_id' | 'created_at'>>;

export async function createPayment(row: PaymentInsert): Promise<Payment> {
  const { data, error } = await supabase.from('payments').insert(row).select('*').single();
  if (error) throw error;
  return data as Payment;
}

export async function updatePayment(id: string, row: PaymentUpdate): Promise<Payment> {
  const { data, error } = await supabase.from('payments').update(row).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
}
