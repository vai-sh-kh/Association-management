-- Seed 100 members with detailed data for development/testing.
-- Run with: supabase db reset (applies migrations then runs this seed)
WITH fns AS (SELECT ARRAY['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Elizabeth'] AS arr),
     lns AS (SELECT ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'] AS arr),
     buildings_arr AS (
  SELECT * FROM unnest(ARRAY['Tower A','Tower B','Tower C','Tower D','Tower E','Building 1','Building 2','Garden Block','Plaza East','Plaza West']) WITH ORDINALITY AS t(building, ord)
),
occupations_arr AS (
  SELECT * FROM unnest(ARRAY[
    'Software Engineer','Teacher','Nurse','Accountant','Architect','Designer','Manager','Consultant','Engineer','Lawyer',
    'Doctor','Pharmacist','Marketing Lead','Sales Rep','HR Manager','Developer','Analyst','Chef','Electrician','Writer',
    'Professor','Dentist','Veterinarian','Pilot','Real Estate Agent','Photographer','Artist','Therapist','Coach','Administrator'
  ]) WITH ORDINALITY AS t(occupation, ord)
),
statuses_arr AS (
  SELECT * FROM unnest(ARRAY['Active','Inactive']) WITH ORDINALITY AS t(status, ord)
),
nums AS (
  SELECT generate_series(1, 100) AS n
),
prepared AS (
  SELECT
    n,
    'A-' || LPAD(n::text, 3, '0') AS member_id,
    (SELECT arr[(n - 1) % 10 + 1] FROM fns) || ' ' || (SELECT arr[(n - 1) / 10 + 1] FROM lns) AS name,
    'member' || n || '@example.com' AS email,
    CASE WHEN n % 4 != 0 THEN '+91' ELSE NULL END AS phone_country_code,
    CASE WHEN n % 4 != 0 THEN '98765' || LPAD((9000 + n)::text, 4, '0') ELSE NULL END AS phone,
    (100 + ((n - 1) % 20) + 1)::text AS unit,
    (SELECT building FROM buildings_arr WHERE ord = 1 + (n - 1) % 10) AS building,
    CASE WHEN n % 2 = 0 THEN 'Owner' ELSE 'Tenant' END AS member_type,
    (SELECT status FROM statuses_arr WHERE ord = 1 + (n - 1) % 2) AS status,
    (DATE '1950-01-01' + ((n * 97) % 25000) * INTERVAL '1 day')::date AS date_of_birth,
    (SELECT occupation FROM occupations_arr WHERE ord = 1 + (n - 1) % 30) AS occupation,
    (100 + n) || ' Oak Residence, Unit ' || (100 + ((n - 1) % 20) + 1) AS residential_address,
    (100 + n) || ' Oak Residence, Unit ' || (100 + ((n - 1) % 20) + 1) AS mailing_address,
    (DATE '2020-01-01' + ((n * 31) % 1400) * INTERVAL '1 day')::date AS move_in_date,
    CASE WHEN (SELECT status FROM statuses_arr WHERE ord = 1 + (n - 1) % 2) = 'Inactive' AND n % 5 = 0
         THEN (DATE '2024-06-01' + (n % 200) * INTERVAL '1 day')::date ELSE NULL END AS move_out_date,
    (SELECT arr[(n % 10) + 1] FROM fns) || ' ' || (SELECT arr[(n % 10) + 1] FROM lns) AS emergency_contact_name,
    CASE WHEN n % 3 = 0 THEN 'Spouse' WHEN n % 3 = 1 THEN 'Parent' ELSE 'Sibling' END AS emergency_contact_relationship,
    CASE WHEN n % 2 = 0 THEN '+1-555-' || LPAD((800 + n)::text, 4, '0') ELSE NULL END AS emergency_contact_phone,
    'emergency' || n || '@example.com' AS emergency_contact_email,
    CASE WHEN n % 7 != 0 THEN (NOW() - (n % 72 || ' hours')::interval) ELSE NULL END AS last_access,
    CASE WHEN n % 7 != 0 THEN 'Main Gate' ELSE NULL END AS last_access_location,
    CASE WHEN n % 10 = 0 THEN 'Note for member ' || n ELSE NULL END AS notes
  FROM nums
)
INSERT INTO members (
  member_id,
  name,
  email,
  phone_country_code,
  phone,
  unit,
  building,
  member_type,
  status,
  date_of_birth,
  occupation,
  residential_address,
  mailing_address,
  move_in_date,
  move_out_date,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_phone,
  emergency_contact_email,
  last_access,
  last_access_location,
  notes
)
SELECT
  member_id,
  name,
  email,
  phone_country_code,
  phone,
  unit,
  building,
  member_type,
  status,
  date_of_birth,
  occupation,
  residential_address,
  mailing_address,
  move_in_date,
  move_out_date,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_phone,
  emergency_contact_email,
  last_access,
  last_access_location,
  notes
FROM prepared
ON CONFLICT (member_id) DO NOTHING;
