/*
# Seed demo accounts and sample data

Creates 5 demo users + profiles + companies + shipments + quotes + border reports.
Fixed UUID format and ASCII-only strings.
*/

-- Create admin user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
) VALUES (
  'a1000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@borderwatch.africa',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User","role":"superadmin","plan":"enterprise"}',
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create transporter user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
) VALUES (
  'a2000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'company@test.com',
  crypt('company123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Themba Ndlovu","role":"transporter","plan":"business","company_name":"Ndlovu Transport Group"}',
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create cargo owner user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
) VALUES (
  'a3000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'shipper@test.com',
  crypt('shipper123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sipho Dlamini","role":"cargo_owner","plan":"starter","company_name":"Copperbelt Mining Supplies"}',
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create driver user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
) VALUES (
  'a4000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'driver@test.com',
  crypt('driver123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Peter Dube","role":"driver","plan":"starter"}',
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create platform owner user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
) VALUES (
  'a5000000-0000-0000-0000-000000000005'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'owner@borderwatch.africa',
  crypt('owner123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Platform Owner","role":"superadmin","plan":"enterprise"}',
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Upsert profiles for all demo users
INSERT INTO public.profiles (id, full_name, role, plan, points, company_name, verified)
VALUES
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Admin User', 'superadmin', 'enterprise', 0, NULL, true),
  ('a2000000-0000-0000-0000-000000000002'::uuid, 'Themba Ndlovu', 'transporter', 'business', 0, 'Ndlovu Transport Group', true),
  ('a3000000-0000-0000-0000-000000000003'::uuid, 'Sipho Dlamini', 'cargo_owner', 'starter', 0, 'Copperbelt Mining Supplies', false),
  ('a4000000-0000-0000-0000-000000000004'::uuid, 'Peter Dube', 'driver', 'starter', 1240, NULL, false),
  ('a5000000-0000-0000-0000-000000000005'::uuid, 'Platform Owner', 'superadmin', 'enterprise', 0, NULL, true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  plan = EXCLUDED.plan,
  company_name = EXCLUDED.company_name,
  verified = EXCLUDED.verified;

-- Insert driver_profile for the driver demo account
INSERT INTO public.driver_profiles (id, truck_registration, truck_type, routes, report_count, id_verified, truck_verified)
VALUES ('a4000000-0000-0000-0000-000000000004'::uuid, 'GP 123-456', 'Flatbed', ARRAY['JHB to Harare', 'JHB to Beit Bridge'], 127, true, true)
ON CONFLICT (id) DO UPDATE SET
  truck_registration = EXCLUDED.truck_registration,
  truck_type = EXCLUDED.truck_type,
  routes = EXCLUDED.routes,
  report_count = EXCLUDED.report_count,
  id_verified = EXCLUDED.id_verified,
  truck_verified = EXCLUDED.truck_verified;

-- Insert a demo company for the transporter
INSERT INTO public.companies (id, name, country, industry, fleet_size, plan, owner_id, commission_rate)
VALUES (
  'c1000000-0000-0000-0000-000000000001'::uuid,
  'Ndlovu Transport Group',
  'South Africa',
  'General Freight',
  '11-20',
  'business',
  'a2000000-0000-0000-0000-000000000002'::uuid,
  0.06
) ON CONFLICT (id) DO NOTHING;

-- Link transporter profile to company
UPDATE public.profiles SET company_id = 'c1000000-0000-0000-0000-000000000001'::uuid
WHERE id = 'a2000000-0000-0000-0000-000000000002'::uuid;

-- Seed sample shipments from the cargo owner
INSERT INTO public.shipments (id, reference, shipper_id, shipment_type, cargo_type, weight_tons, from_location, to_location, from_country, to_country, budget_range, industry, status, pickup_date, delivery_deadline)
VALUES
  ('b1000000-0000-0000-0000-000000000001'::uuid, 'BW-2026-001', 'a3000000-0000-0000-0000-000000000003'::uuid, 'cross_border', 'Mining Equipment', 24.5, 'Johannesburg', 'Lusaka', 'South Africa', 'Zambia', 'R45000-R55000', 'Mining & Resources', 'open', '2026-06-10', '2026-06-15'),
  ('b2000000-0000-0000-0000-000000000002'::uuid, 'BW-2026-002', 'a3000000-0000-0000-0000-000000000003'::uuid, 'local', 'Steel Coils', 18.0, 'Durban Port', 'Johannesburg', 'South Africa', NULL, 'R12000-R16000', 'Steel & Metals', 'open', '2026-06-08', '2026-06-09'),
  ('b3000000-0000-0000-0000-000000000003'::uuid, 'BW-2026-003', 'a3000000-0000-0000-0000-000000000003'::uuid, 'cross_border', 'Agricultural Produce', 30.0, 'Harare', 'Johannesburg', 'Zimbabwe', 'South Africa', 'R28000-R35000', 'Agriculture & Food', 'quoted', '2026-06-12', '2026-06-14')
ON CONFLICT (id) DO NOTHING;

-- Seed a sample quote from the transporter on shipment 1
INSERT INTO public.quotes (id, shipment_id, carrier_id, price_zar, departure_date, eta_date, message, status)
VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'a2000000-0000-0000-0000-000000000002'::uuid, 48000, '2026-06-10', '2026-06-15', 'We have a dedicated flatbed available on this route. Full insurance included.', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Seed border reports from the driver
INSERT INTO public.border_reports (id, border_name, wait_minutes, causes, driver_id, verified_count, status)
VALUES
  ('e1000000-0000-0000-0000-000000000001'::uuid, 'Beit Bridge (ZA/ZW)', 180, ARRAY['Document Checks', 'High Traffic'], 'a4000000-0000-0000-0000-000000000004'::uuid, 4, 'verified'),
  ('e2000000-0000-0000-0000-000000000002'::uuid, 'Chirundu (ZW/ZM)', 90, ARRAY['Customs Processing'], 'a4000000-0000-0000-0000-000000000004'::uuid, 2, 'unverified'),
  ('e3000000-0000-0000-0000-000000000003'::uuid, 'Lebombo (ZA/MZ)', 45, ARRAY['Low Traffic'], 'a4000000-0000-0000-0000-000000000004'::uuid, 1, 'unverified')
ON CONFLICT (id) DO NOTHING;
