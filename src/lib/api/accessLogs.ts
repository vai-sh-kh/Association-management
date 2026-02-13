import { supabase } from '../supabase';
import type { AccessLog } from '../supabase';

export const accessLogsQueryKey = (memberId: string) => ['members', memberId, 'access_logs'] as const;

export async function fetchAccessLogsByMemberId(memberId: string): Promise<AccessLog[]> {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('accessed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AccessLog[];
}

export type AccessLogInsert = Omit<AccessLog, 'id' | 'created_at'>;

export async function createAccessLog(row: AccessLogInsert): Promise<AccessLog> {
  const { data, error } = await supabase.from('access_logs').insert(row).select('*').single();
  if (error) throw error;
  return data as AccessLog;
}

export async function deleteAccessLog(id: string): Promise<void> {
  const { error } = await supabase.from('access_logs').delete().eq('id', id);
  if (error) throw error;
}
