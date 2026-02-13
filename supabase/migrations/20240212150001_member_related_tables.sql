-- Create vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    vehicle_name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL, -- 'car', 'motorcycle', 'bicycle', etc.
    make TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    license_plate TEXT UNIQUE NOT NULL,
    
    icon TEXT DEFAULT 'directions_car',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create access_logs table
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    location TEXT NOT NULL,
    access_method TEXT NOT NULL, -- 'LPR', 'Digital Pass (NFC)', 'Guest Code', etc.
    status TEXT NOT NULL CHECK (status IN ('Granted', 'Denied')),
    
    accessed_at TIMESTAMPTZ DEFAULT now(),
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    amount DECIMAL(10, 2) NOT NULL,
    payment_type TEXT NOT NULL, -- 'Maintenance', 'Amenity', 'Fine', etc.
    payment_method TEXT, -- 'Credit Card', 'Bank Transfer', 'Cash', etc.
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    
    due_date DATE,
    paid_date DATE,
    
    description TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'ID', 'Lease Agreement', 'Insurance', etc.
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_vehicles_member_id ON vehicles(member_id);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_access_logs_member_id ON access_logs(member_id);
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at DESC);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_documents_member_id ON documents(member_id);

-- Seed data removed; add via app or seed.sql.
