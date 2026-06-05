
-- Users/profiles table (mirrors auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'transporter' CHECK (role IN ('superadmin','transporter','cargo_owner','driver')),
  company_id UUID,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','professional','business','enterprise')),
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN points >= 1001 THEN 'Gold'
      WHEN points >= 501  THEN 'Green'
      WHEN points >= 101  THEN 'Silver'
      ELSE 'Bronze'
    END
  ) STORED,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT,
  country TEXT NOT NULL DEFAULT 'South Africa',
  industry TEXT,
  fleet_size TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  owner_id UUID REFERENCES profiles(id),
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_company" ON companies FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "insert_own_company" ON companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "update_own_company" ON companies FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "delete_own_company" ON companies FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Driver profiles
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  truck_registration TEXT,
  truck_type TEXT,
  employer TEXT,
  id_number TEXT,
  routes TEXT[] DEFAULT '{}',
  report_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2),
  id_verified BOOLEAN NOT NULL DEFAULT false,
  truck_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_driver_profile" ON driver_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_driver_profile" ON driver_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_driver_profile" ON driver_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_own_driver_profile" ON driver_profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Border reports
CREATE TABLE IF NOT EXISTS border_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  border_name TEXT NOT NULL,
  wait_minutes INTEGER NOT NULL,
  causes TEXT[] DEFAULT '{}',
  driver_id UUID REFERENCES profiles(id),
  photo_url TEXT,
  verified_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified','verified','highly_verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE border_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_border_reports" ON border_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_border_report" ON border_reports FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());
CREATE POLICY "update_border_report" ON border_reports FOR UPDATE TO authenticated USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());
CREATE POLICY "delete_border_report" ON border_reports FOR DELETE TO authenticated USING (driver_id = auth.uid());

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  shipper_id UUID NOT NULL REFERENCES profiles(id),
  shipment_type TEXT NOT NULL DEFAULT 'local' CHECK (shipment_type IN ('local','cross_border')),
  cargo_type TEXT NOT NULL,
  weight_tons NUMERIC(10,2),
  special_requirements TEXT[] DEFAULT '{}',
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  from_country TEXT,
  to_country TEXT,
  pickup_date DATE,
  delivery_deadline DATE,
  budget_range TEXT,
  carrier_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','quoted','confirmed','in_transit','delivered','cancelled','disputed')),
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_shipments" ON shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_shipment" ON shipments FOR INSERT TO authenticated WITH CHECK (shipper_id = auth.uid());
CREATE POLICY "update_shipment" ON shipments FOR UPDATE TO authenticated USING (shipper_id = auth.uid()) WITH CHECK (shipper_id = auth.uid());
CREATE POLICY "delete_shipment" ON shipments FOR DELETE TO authenticated USING (shipper_id = auth.uid());

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES profiles(id),
  price_zar NUMERIC(12,2) NOT NULL,
  departure_date DATE,
  eta_date DATE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_quotes" ON quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_quote" ON quotes FOR INSERT TO authenticated WITH CHECK (carrier_id = auth.uid());
CREATE POLICY "update_quote" ON quotes FOR UPDATE TO authenticated USING (carrier_id = auth.uid()) WITH CHECK (carrier_id = auth.uid());
CREATE POLICY "delete_quote" ON quotes FOR DELETE TO authenticated USING (carrier_id = auth.uid());

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  raised_by UUID NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  fault TEXT CHECK (fault IN ('carrier','shipper','both')),
  outcome_requested TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved_carrier','resolved_shipper','refunded','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_disputes" ON disputes FOR SELECT TO authenticated USING (raised_by = auth.uid());
CREATE POLICY "insert_dispute" ON disputes FOR INSERT TO authenticated WITH CHECK (raised_by = auth.uid());
CREATE POLICY "update_dispute" ON disputes FOR UPDATE TO authenticated USING (raised_by = auth.uid()) WITH CHECK (raised_by = auth.uid());
CREATE POLICY "delete_dispute" ON disputes FOR DELETE TO authenticated USING (raised_by = auth.uid());
