-- Enable RLS on all app tables (authenticated users only)

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- members
CREATE POLICY "Authenticated read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update members" ON members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete members" ON members FOR DELETE TO authenticated USING (true);

-- vehicles
CREATE POLICY "Authenticated read vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert vehicles" ON vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update vehicles" ON vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete vehicles" ON vehicles FOR DELETE TO authenticated USING (true);

-- access_logs
CREATE POLICY "Authenticated read access_logs" ON access_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert access_logs" ON access_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update access_logs" ON access_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete access_logs" ON access_logs FOR DELETE TO authenticated USING (true);

-- payments
CREATE POLICY "Authenticated read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update payments" ON payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete payments" ON payments FOR DELETE TO authenticated USING (true);

-- documents
CREATE POLICY "Authenticated read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete documents" ON documents FOR DELETE TO authenticated USING (true);

-- expenses
CREATE POLICY "Authenticated read expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update expenses" ON expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete expenses" ON expenses FOR DELETE TO authenticated USING (true);

-- amenities
CREATE POLICY "Authenticated read amenities" ON amenities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert amenities" ON amenities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update amenities" ON amenities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete amenities" ON amenities FOR DELETE TO authenticated USING (true);
