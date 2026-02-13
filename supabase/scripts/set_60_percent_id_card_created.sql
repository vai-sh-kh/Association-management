-- Set id_card_created = true for 60% of members (deterministic: first 60% by id)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY id) AS rn,
         COUNT(*) OVER () AS total
  FROM members
),
target AS (
  SELECT id
  FROM ranked
  WHERE rn <= GREATEST(1, (total * 0.6)::int)
)
UPDATE members m
SET id_card_created = true
FROM target t
WHERE m.id = t.id;
