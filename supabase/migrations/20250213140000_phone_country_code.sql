-- Add phone_country_code to members; keep phone for number only. Default India +91.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+91';

-- Optional: backfill existing phone values (e.g. "+1-555-1234" -> code +1, number 5551234)
-- We leave existing phone as-is; new data will use phone_country_code + phone.
COMMENT ON COLUMN members.phone_country_code IS 'E.164 country code e.g. +91 for India';
COMMENT ON COLUMN members.phone IS 'Subscriber number without country code';
