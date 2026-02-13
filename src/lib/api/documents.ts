import { supabase } from '../supabase';
import type { Document } from '../supabase';

export const documentsQueryKey = (memberId: string) => ['members', memberId, 'documents'] as const;

export async function fetchDocumentsByMemberId(memberId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('member_id', memberId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Document[];
}

export type DocumentInsert = Omit<Document, 'id' | 'created_at'>;

export async function createDocument(row: DocumentInsert): Promise<Document> {
  const { data, error } = await supabase.from('documents').insert(row).select('*').single();
  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}
