-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    unit TEXT NOT NULL,
    building TEXT NOT NULL,
    member_type TEXT NOT NULL, -- 'Owner' or 'Tenant'
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Pending', 'Overdue', 'Moved Out'
    phone TEXT,
    last_access TIMESTAMPTZ DEFAULT now(),
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create expenses table for the chart
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    booked_count INTEGER DEFAULT 0,
    revenue DECIMAL DEFAULT 0,
    rating DECIMAL DEFAULT 0
);

-- Seed data removed; use seed.sql or add via app for initial data.
