/*
# Fix bcrypt cost factor for demo account passwords

## Problem
GoTrue (Supabase Auth server) requires bcrypt cost factor 10 ($2a$10$).
Previous migrations used gen_salt('bf') which defaults to cost factor 6 ($2a$06$),
causing "Database error querying schema" / auth failures on signInWithPassword.

## Fix
Re-hashes all 5 demo account passwords using gen_salt('bf', 10) to produce
$2a$10$ hashes that GoTrue can verify correctly.
*/

UPDATE auth.users SET
  encrypted_password = crypt('Admin@2024', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'a1000000-0000-0000-0000-000000000001'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Company@2024', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'a2000000-0000-0000-0000-000000000002'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Shipper@2024', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'a3000000-0000-0000-0000-000000000003'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Driver@2024', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'a4000000-0000-0000-0000-000000000004'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Owner@2024', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'a5000000-0000-0000-0000-000000000005'::uuid;
