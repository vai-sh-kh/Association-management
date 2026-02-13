-- Drop unused amenities table (not referenced by the app).
-- Keep: members, vehicles, access_logs, payments, documents, expenses.

-- Drop RLS policies first (required before dropping the table)
DROP POLICY IF EXISTS "Authenticated read amenities" ON amenities;
DROP POLICY IF EXISTS "Authenticated insert amenities" ON amenities;
DROP POLICY IF EXISTS "Authenticated update amenities" ON amenities;
DROP POLICY IF EXISTS "Authenticated delete amenities" ON amenities;

-- Drop the table
DROP TABLE IF EXISTS amenities;
