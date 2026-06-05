import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'superadmin' | 'transporter' | 'cargo_owner' | 'driver';
  company_id: string | null;
  company_name: string | null;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  points: number;
  level: string;
  verified: boolean;
  created_at: string;
};

export type BorderReport = {
  id: string;
  border_name: string;
  wait_minutes: number;
  causes: string[];
  driver_id: string | null;
  photo_url: string | null;
  verified_count: number;
  status: 'unverified' | 'verified' | 'highly_verified';
  created_at: string;
};

export type Shipment = {
  id: string;
  reference: string;
  shipper_id: string;
  shipment_type: 'local' | 'cross_border';
  cargo_type: string;
  weight_tons: number | null;
  special_requirements: string[];
  from_location: string;
  to_location: string;
  from_country: string | null;
  to_country: string | null;
  pickup_date: string | null;
  delivery_deadline: string | null;
  budget_range: string | null;
  carrier_preference: string | null;
  notes: string | null;
  status: 'open' | 'quoted' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
  industry: string | null;
  created_at: string;
};

export type Quote = {
  id: string;
  shipment_id: string;
  carrier_id: string;
  price_zar: number;
  departure_date: string | null;
  eta_date: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  registration_number: string | null;
  country: string;
  industry: string | null;
  fleet_size: string | null;
  plan: string;
  owner_id: string | null;
  commission_rate: number;
  created_at: string;
};
