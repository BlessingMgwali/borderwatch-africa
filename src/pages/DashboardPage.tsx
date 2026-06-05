import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shield, Truck, Package, BarChart3, Bell, Settings,
  AlertTriangle, TrendingUp, MapPin, ChevronRight, Menu, X,
  Send, DollarSign, Star, CheckCircle, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, Shipment, Quote } from '../lib/supabase';
import { INDUSTRY_MAP, CARGO_TYPES, BUDGET_RANGES } from '../config/data';
import { formatZAR, commissionRate, platformFee, carrierReceives } from '../config/payments';

// ─── Data ────────────────────────────────────────────────────────────────────

const BORDER_MINI = [
  { name: 'Beitbridge', status: 'SEVERE', wait: '8h 20min', color: '#E24B4A' },
  { name: 'Kazungula', status: 'MODERATE', wait: '3h 10min', color: '#F2A623' },
  { name: 'Lebombo', status: 'FLOWING', wait: '45 min', color: '#1D9E75' },
  { name: 'Groblersbrug', status: 'MODERATE', wait: '2h 40min', color: '#F2A623' },
  { name: 'Chirundu', status: 'FLOWING', wait: '1h 10min', color: '#1D9E75' },
];

const ALERTS = [
  { icon: AlertTriangle, text: 'BW-001 has been waiting at Beitbridge for 8h 20min. Consider rerouting.', time: '5 min ago', color: '#E24B4A' },
  { icon: TrendingUp, text: 'New load match: JHB → Harare, 32t, R18,400 — 97% match with BW-003 return route.', time: '12 min ago', color: '#1D9E75' },
  { icon: MapPin, text: 'BW-002 has arrived at Chirundu border post. Expected crossing time: 1h 10min.', time: '28 min ago', color: '#F2A623' },
];

const KPI_CARDS = [
  { label: 'Active Trucks', value: '4', sub: '2 in transit', color: '#0F2044' },
  { label: 'At Borders', value: '1', sub: 'Beitbridge · Delayed', color: '#F2A623' },
  { label: 'Load Matches', value: '7', sub: 'New today', color: '#E85D24' },
  { label: 'Net Earnings', value: 'R130,640', sub: 'This month', color: '#1D9E75' },
];

const SHIPMENT_REQUESTS = [
  { ref: 'BW-SHP-0234', industry: 'Mining & Resources', from: 'JHB', to: 'Lusaka', cargo: 'Mining Equipment', weight: 32, budgetMin: 15000, budgetMax: 30000, special: ['Hazmat certified driver'], date: 'Tomorrow', posted: '2h ago', type: 'cross_border' },
  { ref: 'BW-SHP-0241', industry: 'Agriculture & Farming', from: 'Tzaneen', to: 'Durban', cargo: 'Agricultural Produce', weight: 18, budgetMin: 6000, budgetMax: 9000, special: ['Reefer truck required'], date: 'Thursday', posted: '1h ago', type: 'local' },
  { ref: 'BW-SHP-0247', industry: 'Construction & Infrastructure', from: 'JHB', to: 'Maputo', cargo: 'Construction Materials', weight: 25, budgetMin: 12000, budgetMax: 20000, special: [], date: 'Friday', posted: '30min ago', type: 'cross_border' },
  { ref: 'BW-SHP-0251', industry: 'Cold Chain & Perishables', from: 'JHB', to: 'Cape Town', cargo: 'Refrigerated Goods', weight: 10, budgetMin: 8000, budgetMax: 14000, special: ['Reefer truck required', 'GPS tracking required'], date: 'Monday', posted: '4h ago', type: 'local' },
];

const MY_QUOTES = [
  { ref: 'BW-SHP-0198', route: 'Cape Town → Harare', amount: 12200, status: 'accepted', date: '2 Jun 2026' },
  { ref: 'BW-SHP-0234', route: 'JHB → Lusaka', amount: 18400, status: 'pending', date: '5 Jun 2026' },
  { ref: 'BW-SHP-0156', route: 'Durban → JHB', amount: 6800, status: 'declined', date: '1 Jun 2026' },
  { ref: 'BW-SHP-0223', route: 'JHB → Maputo', amount: 9800, status: 'pending', date: '4 Jun 2026' },
];

const ACTIVE_SHIPMENTS = [
  { ref: 'BW-SHP-0198', from: 'Cape Town', to: 'Harare', cargo: 'Agricultural · 15t', driver: 'Peter Dube', truck: 'BW-002', eta: 'Tomorrow 14:00', border: 'Beitbridge', borderWait: '8h expected', status: 'In Transit' },
];

interface NavItem { label: string; icon: typeof LayoutDashboard; href: string; badge?: number; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Border Status', icon: Shield, href: '/dashboard/borders' },
  { label: 'My Fleet', icon: Truck, href: '/dashboard/fleet' },
  { label: 'Freight Marketplace', icon: Package, href: '/dashboard/marketplace' },
  { label: 'Shipment Requests', icon: Send, href: '/dashboard/requests' },
  { label: 'My Quotes', icon: FileText, href: '/dashboard/quotes' },
  { label: 'Active Shipments', icon: MapPin, href: '/dashboard/active' },
  { label: 'Earnings', icon: DollarSign, href: '/dashboard/earnings' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Alerts', icon: Bell, href: '/dashboard/alerts', badge: 3 },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0F2044] z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E85D24] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="9" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold text-sm">BorderWatch<span className="text-[#E85D24]">Africa</span></span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white"><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon, href, badge }) => {
            const active = location.pathname === href;
            return (
              <Link key={label} to={href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#E85D24] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && <span className="bg-[#E24B4A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-[#E85D24] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0) ?? 'T'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name ?? 'Themba Ndlovu'}</div>
              <div className="flex items-center gap-1">
                <span className="inline-block bg-[#E85D24]/20 text-[#E85D24] text-xs font-medium px-1.5 py-0.5 rounded capitalize">{user?.plan ?? 'Business'} Plan</span>
                <span className="text-white/40 text-xs">{Math.round(commissionRate(user?.plan ?? 'business') * 100)}% commission</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Plan benefits banner ─────────────────────────────────────────────────────

function PlanBenefitsBanner() {
  const { user } = useAuth();
  if (!user?.plan || user.plan === 'starter') return null;
  const rate = Math.round(commissionRate(user.plan) * 100);
  return (
    <div className="bg-gradient-to-r from-[#0F2044] to-[#1a3060] rounded-xl p-4 mb-6 text-white">
      <div className="text-xs font-bold text-[#E85D24] uppercase tracking-wider mb-2">Your {user.plan} Plan Benefits</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {[
          `✅ ${rate}% commission rate (vs 10% standard)`,
          '✅ Priority listing in search results',
          '✅ Verified member badge',
          '✅ All 18 border posts',
          '✅ AI route intelligence',
          '✅ 5 vehicles tracked',
        ].map((b) => <span key={b} className="text-white/80">{b}</span>)}
      </div>
    </div>
  );
}

// ─── IndustryBadge ────────────────────────────────────────────────────────────

function IndustryBadge({ industry }: { industry: string }) {
  const cfg = INDUSTRY_MAP[industry] ?? INDUSTRY_MAP['Other'];
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// ─── Sub-pages ─────────────────────────────────────────────────────────────────

function DashboardHome() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F2044]">Good morning, {user?.name?.split(' ')[0] ?? 'Themba'}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{today}</p>
      </div>

      <PlanBenefitsBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-2 font-medium">{kpi.label}</div>
            <div className="text-2xl font-black mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs text-[#6B7280]">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0F2044] text-sm">Border Status</h2>
            <Link to="/dashboard/borders" className="text-xs text-[#E85D24] hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {BORDER_MINI.map((b) => (
              <div key={b.name} className="flex items-center px-5 py-3 gap-3 hover:bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }}></span>
                <span className="text-sm font-medium text-[#0F2044] flex-1">{b.name}</span>
                <span className="text-xs font-semibold" style={{ color: b.color }}>{b.status}</span>
                <span className="text-xs text-[#6B7280] w-16 text-right">{b.wait}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0F2044] text-sm flex items-center gap-2">
              Recent Alerts <span className="bg-[#E24B4A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </h2>
            <Link to="/dashboard/alerts" className="text-xs text-[#E85D24] hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {ALERTS.map((alert, i) => (
              <div key={i} className="px-5 py-3.5 flex gap-3 hover:bg-gray-50">
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${alert.color}15` }}>
                  <alert.icon size={13} style={{ color: alert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#0F2044] leading-relaxed">{alert.text}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentRequestsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState<Shipment | null>(null);
  const [price, setPrice] = useState('');
  const [departure, setDeparture] = useState('');
  const [eta, setEta] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    supabase.from('shipments').select('*').eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setShipments((data ?? []) as Shipment[]); setLoading(false); });
  }, []);

  const industries = ['All', ...new Set(shipments.map((s) => s.industry ?? 'Other').filter(Boolean))];
  const filtered = filter === 'All' ? shipments : shipments.filter((s) => (s.industry ?? 'Other') === filter);

  const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
  const plan = user?.plan ?? 'starter';
  const fee = platformFee(priceNum, plan);
  const receives = carrierReceives(priceNum, plan);

  const handleClose = () => { setQuoting(null); setPrice(''); setDeparture(''); setEta(''); setMessage(''); setSubmitted(false); };

  async function handleSubmitQuote() {
    if (!user || !quoting) return;
    setSubmitting(true);
    const { error } = await supabase.from('quotes').insert({
      shipment_id: quoting.id,
      carrier_id: user.id,
      price_zar: priceNum,
      departure_date: departure || null,
      eta_date: eta || null,
      message: message || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Shipment Requests</h1>
      <p className="text-sm text-[#6B7280] mb-5">Open shipments from cargo owners — submit quotes to win loads.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {industries.map((ind) => (
          <button key={ind} onClick={() => setFilter(ind)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === ind ? 'bg-[#0F2044] text-white' : 'bg-white border border-gray-200 text-[#6B7280] hover:border-[#0F2044]'}`}>
            {ind}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">Loading shipments...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-[#0F2044] mb-2">No open shipments</h2>
          <p className="text-sm text-[#6B7280]">Check back soon — cargo owners are posting loads daily.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-2">
                  {s.industry && <IndustryBadge industry={s.industry} />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.shipment_type === 'local' ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#FFF4EE] text-[#E85D24]'}`}>
                    {s.shipment_type === 'local' ? 'Local' : 'Cross-Border'}
                  </span>
                </div>
                <span className="text-xs text-[#6B7280] font-mono">{s.reference}</span>
              </div>
              <div className="font-black text-[#0F2044] text-base mb-1">{s.from_location} → {s.to_location}</div>
              <div className="text-sm text-[#6B7280] mb-2">{s.cargo_type}{s.weight_tons ? ` · ${s.weight_tons}t` : ''}{s.pickup_date ? ` · ${s.pickup_date}` : ''}</div>
              {s.budget_range && <div className="text-sm font-bold text-[#0F2044] mb-3">{s.budget_range}</div>}
              <button onClick={() => { setQuoting(s); setSubmitted(false); }}
                className="w-full bg-[#E85D24] text-white font-semibold py-2.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">
                Submit Quote
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quote modal */}
      <AnimatePresence>
        {quoting && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={handleClose}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {submitted ? (
                <div className="p-8 text-center">
                  <CheckCircle size={48} className="text-[#1D9E75] mx-auto mb-4" />
                  <h3 className="text-xl font-black text-[#0F2044] mb-2">Quote Submitted!</h3>
                  <p className="text-[#6B7280] mb-6">The cargo owner will be notified.</p>
                  <button onClick={handleClose} className="w-full bg-[#0F2044] text-white font-semibold py-3 rounded-xl">Done</button>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-[#0F2044]">Submit Quote — {quoting.reference}</h3>
                    <button onClick={handleClose}><X size={20} className="text-[#6B7280]" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-sm bg-[#F8F9FA] rounded-lg p-3 text-[#6B7280]">
                      {quoting.from_location} → {quoting.to_location} · {quoting.cargo_type}{quoting.weight_tons ? ` · ${quoting.weight_tons}t` : ''}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Your price (ZAR)</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                        placeholder="e.g. 18000" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Departure date</label>
                      <input type="date" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                        value={departure} onChange={(e) => setDeparture(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Estimated arrival</label>
                      <input type="date" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                        value={eta} onChange={(e) => setEta(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Message</label>
                      <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none resize-none"
                        placeholder="Introduce your service..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    {priceNum > 0 && (
                      <div className="bg-[#F8F9FA] rounded-xl p-3 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-[#6B7280]">Your quote</span><span className="font-bold text-[#0F2044]">{formatZAR(priceNum)}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Platform fee ({Math.round(commissionRate(plan) * 100)}%)</span><span className="text-[#E24B4A] font-bold">−{formatZAR(fee)}</span></div>
                        <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-bold text-[#0F2044]">You receive</span><span className="font-black text-[#1D9E75]">{formatZAR(receives)}</span></div>
                      </div>
                    )}
                    <button onClick={handleSubmitQuote} disabled={!price || !departure || submitting}
                      className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                      {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : 'Submit Quote'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MyQuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<(Quote & { shipment_ref: string; route: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: quotesData } = await supabase.from('quotes').select('*')
        .eq('carrier_id', user.id).order('created_at', { ascending: false });
      if (!quotesData) { setLoading(false); return; }
      const shipmentIds = [...new Set((quotesData as Quote[]).map((q) => q.shipment_id))];
      const { data: shipmentsData } = await supabase.from('shipments')
        .select('id, reference, from_location, to_location').in('id', shipmentIds);
      const smap = new Map((shipmentsData ?? []).map((s: { id: string; reference: string; from_location: string; to_location: string }) => [s.id, s]));
      setQuotes((quotesData as Quote[]).map((q) => {
        const s = smap.get(q.shipment_id) as { reference: string; from_location: string; to_location: string } | undefined;
        return { ...q, shipment_ref: s?.reference ?? '—', route: s ? `${s.from_location} → ${s.to_location}` : '—' };
      }));
      setLoading(false);
    })();
  }, [user]);

  const statusMap = {
    accepted: { label: 'Accepted', color: '#1D9E75', bg: '#F0FDF4' },
    pending: { label: 'Pending', color: '#F2A623', bg: '#FFFBEB' },
    declined: { label: 'Declined', color: '#E24B4A', bg: '#FEF2F2' },
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">My Quotes</h1>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">Loading...</div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Send size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">No quotes submitted yet. Browse Shipment Requests to start bidding.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Reference', 'Route', 'Amount', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map((q) => {
                  const st = statusMap[q.status as keyof typeof statusMap];
                  return (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-[#0F2044]">{q.shipment_ref}</td>
                      <td className="px-5 py-3.5 text-sm text-[#0F2044]">{q.route}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{formatZAR(Number(q.price_zar))}</td>
                      <td className="px-5 py-3.5 text-sm text-[#6B7280]">{new Date(q.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveShipmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Active Shipments</h1>
      <div className="space-y-4">
        {ACTIVE_SHIPMENTS.map((s) => (
          <div key={s.ref} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-xs text-[#6B7280] mb-1">{s.ref}</div>
                <div className="font-black text-[#0F2044] text-lg">{s.from} → {s.to}</div>
                <div className="text-sm text-[#6B7280] mt-0.5">{s.cargo}</div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0369A1]/10 text-[#0369A1]">{s.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div><div className="text-xs text-[#6B7280] mb-0.5">Driver</div><div className="font-medium text-[#0F2044]">{s.driver}</div></div>
              <div><div className="text-xs text-[#6B7280] mb-0.5">Truck</div><div className="font-medium text-[#0F2044]">{s.truck}</div></div>
              <div><div className="text-xs text-[#6B7280] mb-0.5">ETA</div><div className="font-medium text-[#0F2044]">{s.eta}</div></div>
              <div><div className="text-xs text-[#6B7280] mb-0.5">Border</div><div className="text-xs text-[#E24B4A] font-bold">{s.border} — {s.borderWait}</div></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 border-2 border-[#0F2044] text-[#0F2044] font-semibold py-2 rounded-lg text-sm hover:bg-[#0F2044] hover:text-white transition-colors">Update Status</button>
              <button className="flex-1 border-2 border-gray-200 text-[#6B7280] font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">Contact Shipper</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EarningsPage() {
  const { user } = useAuth();
  const plan = user?.plan ?? 'business';
  const rate = commissionRate(plan);
  const gross = 142000;
  const fee = Math.round(gross * rate);
  const net = gross - fee;

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Earnings</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Shipments Completed', value: '8', color: '#0F2044' },
          { label: 'Gross Earnings', value: formatZAR(gross), color: '#0F2044' },
          { label: `Platform Commission (${Math.round(rate * 100)}%)`, value: `−${formatZAR(fee)}`, color: '#E24B4A' },
          { label: 'Net Earnings', value: formatZAR(net), color: '#1D9E75' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-2">{kpi.label}</div>
            <div className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#0F2044]">Pending Payment</h2>
          <span className="text-xl font-black text-[#F2A623]">{formatZAR(18400)}</span>
        </div>
        <p className="text-sm text-[#6B7280] mb-4">1 confirmed shipment pending payout.</p>
        <button className="flex items-center gap-2 bg-[#0F2044] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1a3060] transition-colors text-sm">
          <FileText size={15} /> Download Statement
        </button>
      </div>
    </div>
  );
}

function GenericPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-4">{title}</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-[#6B7280]">This section is coming soon.</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  let content: React.ReactNode;
  if (path === '/dashboard' || path === '/dashboard/') content = <DashboardHome />;
  else if (path === '/dashboard/requests') content = <ShipmentRequestsPage />;
  else if (path === '/dashboard/quotes') content = <MyQuotesPage />;
  else if (path === '/dashboard/active') content = <ActiveShipmentsPage />;
  else if (path === '/dashboard/earnings') content = <EarningsPage />;
  else if (path === '/dashboard/borders') content = <GenericPage title="Border Status" />;
  else if (path === '/dashboard/fleet') content = <GenericPage title="My Fleet" />;
  else if (path === '/dashboard/marketplace') content = <GenericPage title="Freight Marketplace" />;
  else if (path === '/dashboard/analytics') content = <GenericPage title="Analytics" />;
  else if (path === '/dashboard/alerts') content = <GenericPage title="Alerts" />;
  else if (path === '/dashboard/settings') content = <GenericPage title="Settings" />;
  else content = <DashboardHome />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0F2044]">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-[#0F2044] text-sm">Dashboard</span>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
