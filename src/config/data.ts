// ─── Industries ───────────────────────────────────────────────────────────────

export interface IndustryConfig {
  label: string;
  color: string;
  bg: string;
  emoji: string;
}

export const INDUSTRY_MAP: Record<string, IndustryConfig> = {
  'Mining & Resources': { label: 'Mining', color: '#374151', bg: '#F3F4F6', emoji: '⛏️' },
  'Agriculture & Farming': { label: 'Agriculture', color: '#166534', bg: '#F0FDF4', emoji: '🌾' },
  'Food & Beverage': { label: 'Food & Bev', color: '#92400E', bg: '#FFFBEB', emoji: '🍎' },
  'Retail & FMCG': { label: 'Retail', color: '#1E40AF', bg: '#EFF6FF', emoji: '🛒' },
  'Construction & Infrastructure': { label: 'Construction', color: '#92400E', bg: '#FFFBEB', emoji: '🏗️' },
  'Manufacturing': { label: 'Manufacturing', color: '#374151', bg: '#F3F4F6', emoji: '🏭' },
  'Pharmaceutical & Medical': { label: 'Pharma', color: '#0F766E', bg: '#F0FDFA', emoji: '💊' },
  'Government & NGO': { label: 'Government', color: '#6B21A8', bg: '#FAF5FF', emoji: '🏛️' },
  'Oil & Gas': { label: 'Oil & Gas', color: '#9A3412', bg: '#FFF7ED', emoji: '🛢️' },
  'Timber & Forestry': { label: 'Timber', color: '#3F6212', bg: '#F7FEE7', emoji: '🪵' },
  'Automotive': { label: 'Automotive', color: '#1E3A5F', bg: '#EFF6FF', emoji: '🚗' },
  'Electronics & Technology': { label: 'Electronics', color: '#1D4ED8', bg: '#EFF6FF', emoji: '💻' },
  'Chemicals': { label: 'Chemicals', color: '#7C2D12', bg: '#FFF7ED', emoji: '⚗️' },
  'Cold Chain & Perishables': { label: 'Cold Chain', color: '#0369A1', bg: '#F0F9FF', emoji: '❄️' },
  'Import & Export (General)': { label: 'Import/Export', color: '#4B5563', bg: '#F9FAFB', emoji: '📦' },
  'Other': { label: 'Other', color: '#6B7280', bg: '#F9FAFB', emoji: '📋' },
};

export const INDUSTRIES = Object.keys(INDUSTRY_MAP);

export const CARGO_TYPES = [
  'General Cargo',
  'Refrigerated Goods',
  'Mining Equipment',
  'Agricultural Produce',
  'Construction Materials',
  'Hazardous Materials',
  'Oversized Load',
  'Bulk Liquid',
  'Livestock',
  'Retail/FMCG',
  'Pharmaceuticals',
  'Other',
];

export const BUDGET_RANGES = [
  'Under R5,000',
  'R5,000 - R15,000',
  'R15,000 - R30,000',
  'R30,000 - R60,000',
  'R60,000+',
  'Open to quotes',
];

export const TRUCK_TYPES = [
  'Interlink/Superlink',
  'Side tipper',
  'Flatbed',
  'Reefer/Refrigerated',
  'Tanker',
  'Curtainsider',
  'Tautliner',
  'Abnormal load',
  'LDV/Bakkie',
  'Other',
];

export const DRIVER_ROUTES = [
  'JHB → Harare (via Beitbridge)',
  'JHB → Lusaka (via Beitbridge/Chirundu)',
  'JHB → Maputo (via Lebombo)',
  'JHB → Gaborone (via Kopfontein)',
  'JHB → Windhoek (via Nakop)',
  'Durban → JHB',
  'Cape Town → JHB',
  'Durban → Maputo',
  'Local routes only (within SA)',
  'Other',
];

export const BORDERS = [
  'Beitbridge',
  'Kazungula',
  'Lebombo',
  'Chirundu',
  'Groblersbrug',
  'Martins Drift',
  'Ressano Garcia',
  'Kopfontein',
  'Other',
];

export const DELAY_CAUSES = [
  'System down',
  'Staff shortage',
  'Document issues',
  'High volume',
  'Random inspections',
  'Road condition',
  'Weather',
  'Strike/protest',
  'Other',
];

export const POINTS_CONFIG = {
  reportSubmitted: 10,
  reportVerified: 20,
  photoIncluded: 15,
  firstReportOfDay: 25,
  streakBonus: 50,
};

export const REWARDS = [
  { points: 500, reward: '1 month free Professional plan' },
  { points: 1000, reward: 'R50 airtime voucher' },
  { points: 2000, reward: '3 months free Professional plan' },
];

export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
];

export const AFRICAN_COUNTRIES = [
  'South Africa', 'Zimbabwe', 'Zambia', 'Mozambique', 'Botswana', 'Namibia',
  'Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Malawi', 'Angola', 'DRC',
  'Lesotho', 'Eswatini', 'Madagascar', 'Ghana', 'Nigeria', 'Ethiopia',
];
