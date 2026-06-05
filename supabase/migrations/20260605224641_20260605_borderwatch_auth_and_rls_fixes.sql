/*
# BorderWatch Africa — Auth Trigger, Company Name, and RLS Fixes

## Summary
This migration adds:
1. `company_name` column to profiles (convenience denormalization so dashboard can show company without a join)
2. Auto-create-profile trigger: when a new user signs up via Supabase Auth, a row is automatically inserted into `profiles` using data from `raw_user_meta_data` (full_name, phone, role, company_name, plan)
3. Superadmin bypass policies on all tables so admin@borderwatch.africa can read/write everything
4. Fixed quotes UPDATE policy: shippers (shipment owners) can also update quote status so they can accept/decline quotes
5. Fixed companies SELECT policy: members of a company can read it (not just the owner)
6. Auto-increment driver report_count trigger when a border_report is inserted

## Tables Modified
- `profiles`: add `company_name` text column
- All tables: add superadmin bypass SELECT policies

## Security
- Superadmin check uses `(SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'`
- Shippers can now update quote status (accept/decline) on their own shipments
- All existing policies preserved

## Notes
1. The trigger function reads `raw_user_meta_data->>'role'` to set the profile role
2. company_name is denormalized for read performance — no join needed in dashboards
3. Idempotent: uses DROP IF EXISTS on all policies before re-creating
*/

-- 1. Add company_name to profiles if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name TEXT;
  END IF;
END $$;

-- 2. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, company_name, plan, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'transporter'),
    NEW.raw_user_meta_data->>'company_name',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'starter'),
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Auto-create driver_profile on signup if role = driver
CREATE OR REPLACE FUNCTION handle_new_driver()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'driver' THEN
    INSERT INTO public.driver_profiles (id, truck_registration, truck_type, routes)
    VALUES (NEW.id, '', '', '{}')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_driver ON public.profiles;
CREATE TRIGGER on_profile_created_driver
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_driver();

-- 4. Auto-increment driver report_count when border report inserted
CREATE OR REPLACE FUNCTION increment_driver_report_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    UPDATE public.driver_profiles
    SET report_count = report_count + 1
    WHERE id = NEW.driver_id;

    UPDATE public.profiles
    SET points = points + 10
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_border_report_inserted ON public.border_reports;
CREATE TRIGGER on_border_report_inserted
  AFTER INSERT ON public.border_reports
  FOR EACH ROW EXECUTE FUNCTION increment_driver_report_count();

-- 5. Superadmin bypass policies on all tables

-- profiles: superadmin sees all
DROP POLICY IF EXISTS "superadmin_all_profiles" ON profiles;
CREATE POLICY "superadmin_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- companies: members can also read their own company
DROP POLICY IF EXISTS "superadmin_all_companies" ON companies;
CREATE POLICY "superadmin_all_companies" ON companies FOR SELECT
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

DROP POLICY IF EXISTS "superadmin_update_companies" ON companies;
CREATE POLICY "superadmin_update_companies" ON companies FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- member of company can read it
DROP POLICY IF EXISTS "member_read_company" ON companies;
CREATE POLICY "member_read_company" ON companies FOR SELECT
  TO authenticated USING (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- driver_profiles: anyone authenticated can read (for showing driver info on shipments)
DROP POLICY IF EXISTS "authenticated_read_driver_profiles" ON driver_profiles;
CREATE POLICY "authenticated_read_driver_profiles" ON driver_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "superadmin_update_driver_profiles" ON driver_profiles;
CREATE POLICY "superadmin_update_driver_profiles" ON driver_profiles FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- border_reports: superadmin can do everything
DROP POLICY IF EXISTS "superadmin_all_border_reports" ON border_reports;
CREATE POLICY "superadmin_all_border_reports" ON border_reports FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- shipments: superadmin can update
DROP POLICY IF EXISTS "superadmin_update_shipments" ON shipments;
CREATE POLICY "superadmin_update_shipments" ON shipments FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- quotes: shippers can update quotes on their shipments (to accept/decline)
DROP POLICY IF EXISTS "shipper_update_quotes" ON quotes;
CREATE POLICY "shipper_update_quotes" ON quotes FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = quotes.shipment_id
        AND shipments.shipper_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = quotes.shipment_id
        AND shipments.shipper_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "superadmin_update_quotes" ON quotes;
CREATE POLICY "superadmin_update_quotes" ON quotes FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- disputes: superadmin sees and updates all
DROP POLICY IF EXISTS "superadmin_all_disputes" ON disputes;
CREATE POLICY "superadmin_all_disputes" ON disputes FOR SELECT
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

DROP POLICY IF EXISTS "superadmin_update_disputes" ON disputes;
CREATE POLICY "superadmin_update_disputes" ON disputes FOR UPDATE
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  ) WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- 6. Profiles: anyone authenticated can read basic profile info (for showing carrier names in quotes)
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;
CREATE POLICY "authenticated_read_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);
