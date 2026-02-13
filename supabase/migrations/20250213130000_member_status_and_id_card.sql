-- Add id_card_created to members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS id_card_created BOOLEAN NOT NULL DEFAULT false;

-- Backfill status: map Pending, Overdue, Moved Out -> Inactive
UPDATE members
SET status = 'Inactive'
WHERE status IN ('Pending', 'Overdue', 'Moved Out');

-- Drop existing check constraint on status (name may vary; drop by constraint behavior)
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;

-- Add new check: only Active or Inactive
ALTER TABLE members
  ADD CONSTRAINT members_status_check CHECK (status IN ('Active', 'Inactive'));
