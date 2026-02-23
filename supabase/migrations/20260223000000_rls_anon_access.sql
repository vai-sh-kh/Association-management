-- Allow anon role full CRUD access on all app tables.
-- Needed because the app runs in demo mode (IS_DEMO=true) which skips
-- Supabase auth, so all requests arrive as the anon role.

-- members
DROP POLICY IF EXISTS "Anon read members"   ON members;
DROP POLICY IF EXISTS "Anon insert members" ON members;
DROP POLICY IF EXISTS "Anon update members" ON members;
DROP POLICY IF EXISTS "Anon delete members" ON members;
CREATE POLICY "Anon read members"   ON members FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert members" ON members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update members" ON members FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete members" ON members FOR DELETE TO anon USING (true);

-- vehicles
DROP POLICY IF EXISTS "Anon read vehicles"   ON vehicles;
DROP POLICY IF EXISTS "Anon insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anon update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anon delete vehicles" ON vehicles;
CREATE POLICY "Anon read vehicles"   ON vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert vehicles" ON vehicles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update vehicles" ON vehicles FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete vehicles" ON vehicles FOR DELETE TO anon USING (true);

-- access_logs
DROP POLICY IF EXISTS "Anon read access_logs"   ON access_logs;
DROP POLICY IF EXISTS "Anon insert access_logs" ON access_logs;
DROP POLICY IF EXISTS "Anon update access_logs" ON access_logs;
DROP POLICY IF EXISTS "Anon delete access_logs" ON access_logs;
CREATE POLICY "Anon read access_logs"   ON access_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert access_logs" ON access_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update access_logs" ON access_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete access_logs" ON access_logs FOR DELETE TO anon USING (true);

-- payments
DROP POLICY IF EXISTS "Anon read payments"   ON payments;
DROP POLICY IF EXISTS "Anon insert payments" ON payments;
DROP POLICY IF EXISTS "Anon update payments" ON payments;
DROP POLICY IF EXISTS "Anon delete payments" ON payments;
CREATE POLICY "Anon read payments"   ON payments FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert payments" ON payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update payments" ON payments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete payments" ON payments FOR DELETE TO anon USING (true);

-- documents
DROP POLICY IF EXISTS "Anon read documents"   ON documents;
DROP POLICY IF EXISTS "Anon insert documents" ON documents;
DROP POLICY IF EXISTS "Anon update documents" ON documents;
DROP POLICY IF EXISTS "Anon delete documents" ON documents;
CREATE POLICY "Anon read documents"   ON documents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert documents" ON documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update documents" ON documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete documents" ON documents FOR DELETE TO anon USING (true);

-- expenses
DROP POLICY IF EXISTS "Anon read expenses"   ON expenses;
DROP POLICY IF EXISTS "Anon insert expenses" ON expenses;
DROP POLICY IF EXISTS "Anon update expenses" ON expenses;
DROP POLICY IF EXISTS "Anon delete expenses" ON expenses;
CREATE POLICY "Anon read expenses"   ON expenses FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert expenses" ON expenses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update expenses" ON expenses FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete expenses" ON expenses FOR DELETE TO anon USING (true);
