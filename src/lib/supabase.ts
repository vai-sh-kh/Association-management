import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.PROD) {
        throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    console.warn('Missing Supabase env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Copy .env.example to .env.local.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Database types
export interface Member {
    id: string;
    member_id: string;
    name: string;
    email: string;
    phone: string | null;
    phone_country_code: string | null;
    date_of_birth: string | null;
    occupation: string | null;
    unit: string;
    building: string;
    residential_address: string | null;
    mailing_address: string | null;
    member_type: 'Owner' | 'Tenant';
    status: 'Active' | 'Inactive';
    id_card_created: boolean;
    move_in_date: string | null;
    move_out_date: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_email: string | null;
    last_access: string | null;
    last_access_location: string | null;
    avatar_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: string;
    member_id: string;
    vehicle_name: string;
    vehicle_type: string;
    make: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
    license_plate: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

export interface AccessLog {
    id: string;
    member_id: string;
    location: string;
    access_method: string;
    status: 'Granted' | 'Denied';
    accessed_at: string;
    created_at: string;
}

export interface Payment {
    id: string;
    member_id: string;
    amount: number;
    payment_type: string;
    payment_method: string | null;
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    due_date: string | null;
    paid_date: string | null;
    description: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: string;
    member_id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    file_size: number | null;
    mime_type: string | null;
    uploaded_at: string;
    expires_at: string | null;
    created_at: string;
}
