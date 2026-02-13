import { supabase } from '../supabase';
import type { Member } from '../supabase';

export const membersQueryKey = ['members'] as const;
export const memberQueryKey = (id: string) => ['members', id] as const;

export async function fetchMembers(search?: string): Promise<Member[]> {
  let q = supabase.from('members').select('*').order('member_id', { ascending: true });
  if (search?.trim()) {
    q = q.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,member_id.ilike.%${search.trim()}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Member;
}

export type MemberInsert = Omit<Member, 'id' | 'member_id' | 'created_at' | 'updated_at'> & {
  member_id?: string;
  id_card_created?: boolean;
};
export type MemberUpdate = Partial<Omit<Member, 'id' | 'member_id' | 'created_at'>>;

export async function createMember(row: MemberInsert): Promise<Member> {
  const { data, error } = await supabase.from('members').insert(row).select('*').single();
  if (error) throw error;
  return data as Member;
}

export async function updateMember(id: string, row: MemberUpdate): Promise<Member> {
  const { data, error } = await supabase.from('members').update(row).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Member;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}
