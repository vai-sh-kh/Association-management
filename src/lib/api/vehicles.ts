import { supabase } from '../supabase';
import type { Vehicle } from '../supabase';

export const vehiclesQueryKey = (memberId: string) => ['members', memberId, 'vehicles'] as const;

export async function fetchVehiclesByMemberId(memberId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Vehicle[];
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type VehicleUpdate = Partial<Omit<Vehicle, 'id' | 'member_id' | 'created_at'>>;

export async function createVehicle(row: VehicleInsert): Promise<Vehicle> {
  const { data, error } = await supabase.from('vehicles').insert(row).select('*').single();
  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, row: VehicleUpdate): Promise<Vehicle> {
  const { data, error } = await supabase.from('vehicles').update(row).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}
