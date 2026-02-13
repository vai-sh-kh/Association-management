-- Drop existing members table if it exists
DROP TABLE IF EXISTS members CASCADE;

-- Create enhanced members table with custom ID format
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT UNIQUE NOT NULL, -- Custom format: A-001, A-002, etc.
    
    -- Basic Information
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    occupation TEXT,
    
    -- Residential Information
    unit TEXT NOT NULL,
    building TEXT NOT NULL,
    residential_address TEXT,
    mailing_address TEXT,
    
    -- Member Details
    member_type TEXT NOT NULL CHECK (member_type IN ('Owner', 'Tenant')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    move_in_date DATE,
    move_out_date DATE,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_email TEXT,
    
    -- Access & Security
    last_access TIMESTAMPTZ,
    last_access_location TEXT,
    avatar_url TEXT,
    
    -- Metadata
    notes TEXT,
    id_card_created BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to generate next member ID
CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    new_id TEXT;
BEGIN
    -- Get the highest number from existing member_ids
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(member_id FROM 3) AS INTEGER)),
        0
    ) + 1 INTO next_number
    FROM members
    WHERE member_id ~ '^A-[0-9]+$';
    
    -- Format as A-001, A-002, etc.
    new_id := 'A-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate member_id
CREATE OR REPLACE FUNCTION set_member_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.member_id IS NULL OR NEW.member_id = '' THEN
        NEW.member_id := generate_member_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_member_id
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION set_member_id();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_members_member_id ON members(member_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_unit ON members(unit);

-- Seed data removed; add members via app or seed.sql.
