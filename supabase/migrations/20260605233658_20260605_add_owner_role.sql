/*
# Add 'owner' role to profiles check constraint

## Summary
Adds 'owner' as a valid role value in the profiles table, allowing the
platform owner account to be distinguished from a superadmin.

## Changes
- Drops the existing role check constraint
- Re-creates it with 'owner' added as a valid value
- Updates Blessing Mgwali's profile to role = 'owner'
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['superadmin'::text, 'transporter'::text, 'cargo_owner'::text, 'driver'::text, 'owner'::text]));

UPDATE profiles SET role = 'owner'
WHERE id = 'a5000000-0000-0000-0000-000000000005'::uuid;
