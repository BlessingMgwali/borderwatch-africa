/*
# Update Demo Account Passwords and Profiles

## Summary
Updates the 5 demo accounts to use the new passwords and correct profile data.

## Changes
1. Updates passwords for all 5 auth.users via encrypted_password using pgcrypto crypt()
2. Updates profiles with correct names, roles, company names, plans
3. Fixes driver profile for John Moyo (truck reg BW-001, routes JHB-Harare and JHB-Lusaka)
4. Owner account (owner@borderwatch.africa) gets role 'superadmin' since there is no 'owner' role
   in the profiles check constraint — we handle the 'owner' display in the UI separately.

## Accounts
- admin@borderwatch.africa  / Admin@2024   → role: superadmin
- company@test.com          / Company@2024 → role: transporter, plan: business
- shipper@test.com          / Shipper@2024 → role: cargo_owner
- driver@test.com           / Driver@2024  → role: driver
- owner@borderwatch.africa  / Owner@2024   → role: superadmin (owner sub-role)
*/

-- Update passwords using pgcrypto
UPDATE auth.users SET
  encrypted_password = crypt('Admin@2024', gen_salt('bf')),
  updated_at = now()
WHERE id = 'a1000000-0000-0000-0000-000000000001'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Company@2024', gen_salt('bf')),
  updated_at = now()
WHERE id = 'a2000000-0000-0000-0000-000000000002'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Shipper@2024', gen_salt('bf')),
  updated_at = now()
WHERE id = 'a3000000-0000-0000-0000-000000000003'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Driver@2024', gen_salt('bf')),
  updated_at = now()
WHERE id = 'a4000000-0000-0000-0000-000000000004'::uuid;

UPDATE auth.users SET
  encrypted_password = crypt('Owner@2024', gen_salt('bf')),
  updated_at = now()
WHERE id = 'a5000000-0000-0000-0000-000000000005'::uuid;

-- Fix profile for Admin User
UPDATE profiles SET
  full_name = 'Admin User',
  role = 'superadmin',
  company_name = NULL,
  plan = 'enterprise'
WHERE id = 'a1000000-0000-0000-0000-000000000001'::uuid;

-- Fix profile for Themba Ndlovu (Transporter)
UPDATE profiles SET
  full_name = 'Themba Ndlovu',
  role = 'transporter',
  company_name = 'Ndlovu Transport Group',
  plan = 'business'
WHERE id = 'a2000000-0000-0000-0000-000000000002'::uuid;

-- Fix profile for Sipho Dlamini (Cargo Owner)
UPDATE profiles SET
  full_name = 'Sipho Dlamini',
  role = 'cargo_owner',
  company_name = 'Copperbelt Mining Supplies',
  plan = 'professional'
WHERE id = 'a3000000-0000-0000-0000-000000000003'::uuid;

-- Fix profile for John Moyo (Driver)
UPDATE profiles SET
  full_name = 'John Moyo',
  role = 'driver',
  company_name = NULL,
  plan = 'starter'
WHERE id = 'a4000000-0000-0000-0000-000000000004'::uuid;

-- Fix profile for Blessing Mgwali (Owner) — stored as superadmin role
UPDATE profiles SET
  full_name = 'Blessing Mgwali',
  role = 'superadmin',
  company_name = 'BorderWatch Africa',
  plan = 'enterprise'
WHERE id = 'a5000000-0000-0000-0000-000000000005'::uuid;

-- Fix driver_profile for John Moyo (truck reg BW-001, known routes)
INSERT INTO driver_profiles (id, truck_registration, routes, report_count, rating, id_verified, truck_verified)
VALUES (
  'a4000000-0000-0000-0000-000000000004'::uuid,
  'BW-001',
  ARRAY['JHB-Harare', 'JHB-Lusaka'],
  0,
  5.0,
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  truck_registration = 'BW-001',
  routes = ARRAY['JHB-Harare', 'JHB-Lusaka'];
