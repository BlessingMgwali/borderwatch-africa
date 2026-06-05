import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, List, MessageSquare, History, CreditCard, Settings, Menu, X, Plus, CheckCircle, Star, ChevronRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDUSTRY_MAP, CARGO_TYPES, BUDGET_RANGES, AFRICAN_COUNTRIES, DRIVER_ROUTES } from '../config/data';
import { formatZAR, commissionRate, platformFee, carrierReceives } from '../config/payments';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MY_SHIPMENTS = [
  { ref: 'BW-SHP-0234', cargo: 'Mining Equipment', from: 'JHB', to: 'Lusaka', weight: 32, status: 'open', quotes: 3, industry: 'Mining & Resources' },
  { ref: 'BW-SHP-0198', cargo: 'Agricultural Produce', from: 'Cape Town', to: 'Harare', weight: 15, status: 'in_transit', quotes: 1, industry: 'Agriculture & Farming' },
  { ref: 'BW-SHP-0156', cargo: 'General Cargo', from: 'Durban', to: 'Gaborone', weight: 28, status: 'delivered', quotes: 0, industry: 'Retail & FMCG' },
  { ref: 'BW-SHP-0132', cargo: 'Pharmaceuticals', from: 'JHB', to: 'Maputo', weight: 5, status: 'delivered', quotes: 0, industry: 'Pharmaceutical & Medical' },
];

const ACTIVE_QUOTES = [
  { id: 'Q1', shipmentRef: 'BW-SHP-0234', route: 'JHB → Lusaka', carrier: 'Ndlovu Transport Group', rating: 4.8, reviews: 124, verified: true, plan: 'Business', price: 18400, departure: '2026-06-07', eta: '2026-06-09', truck: 'Interlink/Superlink', message: 'We have done this route 50+ times. Full insurance included.' },
  { id: 'Q2', shipmentRef: 'BW-SHP-0234', route: 'JHB → Lusaka', carrier: 'Copperbelt Hauliers', rating: 4.5, reviews: 88, verified: true, plan: 'Professional', price: 17200, departure: '2026-06-08', eta: '2026-06-10', truck: 'Flatbed', message: 'Competitive rate. We carry mining equipment regularly.' },
  { id: 'Q3', shipmentRef: 'BW-SHP-0234', route: 'JHB → Lusaka', carrier: 'Safari Freight', rating: 4.2, reviews: 43, verified: false, plan: 'Starter', price: 15800, departure: '2026-06-09', eta: '2026-06-12', truck: 'Interlink/Superlink', message: 'Best price guaranteed.' },
];

const PAYMENTS = [
  { ref: 'BW-INV-0234', month: 'Jun 2026', amount: 18400, status: 'Paid', route: 'JHB → Lusaka' },
  { ref: 'BW-INV-0198', month: 'May 2026', amount: 12200, status: 'Paid', route: 'Cape Town → Harare' },
  { ref: 'BW-INV-0156', month: 'May 2026', amount: 22100, status: 'Paid', route: 'Durban → Gaborone' },
  { ref: 'BW-INV-0132', month: 'Apr 2026', amount: 9800, status: 'Paid', route: 'JHB → Maputo' },
];

// ─── Industry badge ───────────────────────────────────────────────────────────

function IndustryBadge({ industry }: { industry: string }) {
  const cfg = INDUSTRY_MAP[industry] ?? INDUSTRY_MAP['Other'];
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/shipper' },
  { label: 'Post a Shipment', icon: Plus, path: '/shipper/post', highlight: true },
  { label: 'My Shipments', icon: List, path: '/shipper/shipments' },
  { label: 'Active Quotes', icon: MessageSquare, path: '/shipper/quotes', badge: 3 },
  { label: 'Shipment History', icon: History, path: '/shipper/history' },
  { label: 'Payments', icon: CreditCard, path: '/shipper/payments' },
  { label: 'Settings', icon: Settings, path: '/shipper/settings' },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

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
          {NAV.map(({ label, icon: Icon, path, highlight, badge }) => {
            const active = location.pathname === path;
            return (
              <Link key={label} to={path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${highlight ? 'bg-[#E85D24] text-white hover:bg-[#d14f1a]' : active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
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
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0) ?? 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name ?? 'Sipho Dlamini'}</div>
              <div className="text-xs text-white/50 truncate">{user?.companyName ?? 'Cargo Owner'}</div>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-white text-xs">Out</button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Accept quote modal ────────────────────────────────────────────────────────

function AcceptModal({ quote, onClose }: { quote: typeof ACTIVE_QUOTES[0] | null; onClose: () => void }) {
  const [done, setDone] = useState(false);
  if (!quote) return null;
  const fee = platformFee(quote.price, 'starter');
  const carrier = carrierReceives(quote.price, 'starter');

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-[#1D9E75] mx-auto mb-4" />
          <h3 className="text-xl font-black text-[#0F2044] mb-2">Booking Confirmed! ✅</h3>
          <p className="text-[#6B7280] mb-6">Your shipment has been confirmed with {quote.carrier}. You will receive a confirmation email.</p>
          <button onClick={onClose} className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl">Done</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-[#0F2044]">Confirm Shipment Booking</h3>
          <button onClick={onClose}><X size={20} className="text-[#6B7280]" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#F8F9FA] rounded-xl">
            <div className="w-10 h-10 bg-[#0F2044] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{quote.carrier.charAt(0)}</span>
            </div>
            <div>
              <div className="font-bold text-[#0F2044] text-sm">{quote.carrier}</div>
              <div className="flex items-center gap-1.5">
                <Star size={12} className="fill-[#F2A623] text-[#F2A623]" />
                <span className="text-xs text-[#6B7280]">{quote.rating} · {quote.reviews} reviews</span>
                {quote.verified && <span className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>}
              </div>
            </div>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-[#6B7280]">Route</span><span className="font-medium text-[#0F2044]">{quote.route}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Shipment value</span><span className="font-bold text-[#0F2044]">{formatZAR(quote.price)}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Platform fee (10%)</span><span className="font-bold text-[#E24B4A]">−{formatZAR(fee)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-[#0F2044]">Carrier receives</span><span className="font-black text-[#1D9E75]">{formatZAR(carrier)}</span></div>
          </div>
          <button onClick={() => setDone(true)} className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl hover:bg-[#d14f1a] transition-colors">
            Confirm & Pay via PayFast
          </button>
          <button onClick={onClose} className="w-full mt-2 text-sm text-[#6B7280] py-2">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-pages ─────────────────────────────────────────────────────────────────

function ShipperHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const activity = [
    { text: 'Quote received from Ndlovu Transport', time: '5 min ago', color: '#1D9E75' },
    { text: 'BW-SHP-0198 delivered successfully', time: '2h ago', color: '#0F2044' },
    { text: 'New quote from Copperbelt Hauliers', time: '3h ago', color: '#1D9E75' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F2044]">Good morning, {user?.name?.split(' ')[0] ?? 'Sipho'}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{user?.companyName ?? 'Copperbelt Mining Supplies'}</p>
        {user?.industry && <IndustryBadge industry={user.industry} />}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Shipments', value: '3', color: '#0F2044' },
          { label: 'Quotes Received', value: '12', color: '#E85D24' },
          { label: 'Completed This Month', value: '8', color: '#1D9E75' },
          { label: 'Total Spent This Month', value: 'R84,200', color: '#F2A623' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-2">{kpi.label}</div>
            <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <button onClick={() => navigate('/shipper/post')}
        className="w-full bg-[#E85D24] text-white font-black py-4 rounded-2xl text-base mb-6 hover:bg-[#d14f1a] transition-colors flex items-center justify-center gap-2">
        <Plus size={20} /> Post New Shipment
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0F2044]">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activity.map((a, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
              <div className="flex-1">
                <p className="text-sm text-[#0F2044]">{a.text}</p>
                <p className="text-xs text-[#6B7280]">{a.time}</p>
              </div>
              <ChevronRight size={14} className="text-[#6B7280]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShipmentsPage() {
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    open: { label: 'Open', color: '#1D9E75', bg: '#F0FDF4' },
    in_transit: { label: 'In Transit', color: '#0369A1', bg: '#F0F9FF' },
    delivered: { label: 'Delivered', color: '#6B7280', bg: '#F3F4F6' },
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">My Shipments</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Reference', 'Cargo', 'Route', 'Weight', 'Industry', 'Quotes', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MY_SHIPMENTS.map((s) => {
                const st = statusMap[s.status];
                return (
                  <tr key={s.ref} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-[#0F2044]">{s.ref}</td>
                    <td className="px-5 py-3.5 text-sm text-[#0F2044] font-medium whitespace-nowrap">{s.cargo}</td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{s.from} → {s.to}</td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280]">{s.weight}t</td>
                    <td className="px-5 py-3.5"><IndustryBadge industry={s.industry} /></td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{s.quotes > 0 ? `${s.quotes} quotes` : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {s.status === 'open' && s.quotes > 0 && (
                        <Link to="/shipper/quotes" className="text-xs text-[#E85D24] font-semibold hover:underline">View Quotes</Link>
                      )}
                      {s.status === 'in_transit' && (
                        <button className="text-xs text-[#0369A1] font-semibold hover:underline">Track</button>
                      )}
                      {s.status === 'delivered' && (
                        <button className="text-xs text-[#6B7280] font-semibold hover:underline">Invoice</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuotesPage() {
  const [accepting, setAccepting] = useState<typeof ACTIVE_QUOTES[0] | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Active Quotes</h1>
      <p className="text-sm text-[#6B7280] mb-6">Shipment: BW-SHP-0234 · JHB → Lusaka · Mining Equipment · 32t</p>

      <div className="space-y-4">
        {ACTIVE_QUOTES.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0F2044] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{q.carrier.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-[#0F2044]">{q.carrier}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={12} className={idx < Math.floor(q.rating) ? 'fill-[#F2A623] text-[#F2A623]' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-xs text-[#6B7280]">{q.rating} ({q.reviews} reviews)</span>
                    {q.verified && <span className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>}
                    <span className="text-xs bg-[#0F2044]/10 text-[#0F2044] px-1.5 py-0.5 rounded-full font-bold">{q.plan} Plan</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#0F2044]">{formatZAR(q.price)}</div>
                <div className="text-xs text-[#6B7280]">{q.truck}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-3 text-sm text-[#6B7280]">
              <span>Departs: <span className="font-medium text-[#0F2044]">{q.departure}</span></span>
              <span>ETA: <span className="font-medium text-[#0F2044]">{q.eta}</span></span>
            </div>

            {q.message && <p className="text-sm text-[#6B7280] italic mb-4">"{q.message}"</p>}

            <div className="flex gap-2">
              <button onClick={() => setAccepting(q)}
                className="flex-1 bg-[#E85D24] text-white font-semibold py-2.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">
                Accept Quote
              </button>
              <button className="px-4 border border-gray-200 rounded-lg text-sm font-medium text-[#0F2044] hover:bg-gray-50">Message</button>
              <button className="px-4 border border-gray-200 rounded-lg text-sm font-medium text-[#E24B4A] hover:bg-[#E24B4A]/5">Decline</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {accepting && <AcceptModal quote={accepting} onClose={() => setAccepting(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ShipperHistory() {
  const history = MY_SHIPMENTS.filter((s) => s.status === 'delivered');
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Shipment History</h1>
      <div className="space-y-3">
        {history.map((s) => (
          <div key={s.ref} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-[#6B7280] mb-1">{s.ref}</div>
              <div className="font-bold text-[#0F2044]">{s.from} → {s.to}</div>
              <div className="text-sm text-[#6B7280] mt-0.5">{s.cargo} · {s.weight}t</div>
              <div className="mt-2"><IndustryBadge industry={s.industry} /></div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-2">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={13} className="fill-[#F2A623] text-[#F2A623]" />)}
              </div>
              <button className="text-xs text-[#E85D24] font-semibold hover:underline">Rate & Review</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShipperPayments() {
  const total = PAYMENTS.reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Payments</h1>
      <p className="text-sm text-[#6B7280] mb-6">Total spent: <span className="font-bold text-[#0F2044]">{formatZAR(total)}</span></p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Invoice', 'Month', 'Route', 'Amount', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYMENTS.map((p) => (
                <tr key={p.ref} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-[#0F2044]">{p.ref}</td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280]">{p.month}</td>
                  <td className="px-5 py-3.5 text-sm text-[#0F2044]">{p.route}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{formatZAR(p.amount)}</td>
                  <td className="px-5 py-3.5"><span className="text-xs font-bold px-2 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">{p.status}</span></td>
                  <td className="px-5 py-3.5"><button className="text-xs text-[#E85D24] font-semibold hover:underline">Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Post shipment page (inline with sidebar) ─────────────────────────────────

function PostShipmentPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<'local' | 'cross_border' | null>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [cargo, setCargo] = useState('');
  const [weight, setWeight] = useState('');
  const [special, setSpecial] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [fromCountry, setFromCountry] = useState('South Africa');
  const [toCountry, setToCountry] = useState('');

  const specialOptions = ['Reefer/refrigerated truck', 'Hazmat certified driver', 'Abnormal load permit', 'Armed escort required', 'GPS tracking required', 'Insurance required'];
  const toggleSpecial = (s: string) => setSpecial((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const ref = `BW-SHP-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] bg-white';
  const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <CheckCircle size={64} className="text-[#1D9E75] mb-4" />
        <h2 className="text-2xl font-black text-[#0F2044] mb-2">Shipment Posted!</h2>
        <p className="text-[#6B7280] mb-2">Reference: <span className="font-black text-[#0F2044]">{ref}</span></p>
        <p className="text-sm text-[#6B7280] mb-6">You should receive quotes within 2-4 hours.</p>
        <div className="flex gap-3">
          <Link to="/shipper/shipments" className="bg-[#E85D24] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d14f1a] transition-colors">
            View My Shipments
          </Link>
          <button onClick={() => { setDone(false); setType(null); setStep(1); setCargo(''); setWeight(''); setFrom(''); setTo(''); setPickupDate(''); setBudget(''); }}
            className="border-2 border-[#0F2044] text-[#0F2044] font-semibold px-6 py-3 rounded-xl">
            Post Another
          </button>
        </div>
      </div>
    );
  }

  if (!type) {
    return (
      <div>
        <h1 className="text-2xl font-black text-[#0F2044] mb-2">Post a Shipment</h1>
        <p className="text-sm text-[#6B7280] mb-8">Is this shipment local or cross-border?</p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          {[
            { id: 'local' as const, emoji: '🇿🇦', title: 'Local — Within South Africa', sub: 'Province to province delivery' },
            { id: 'cross_border' as const, emoji: '🌍', title: 'Cross-Border — SADC Countries', sub: 'International freight across SADC' },
          ].map((opt) => (
            <button key={opt.id} onClick={() => { setType(opt.id); setStep(1); }}
              className="text-left rounded-2xl border-2 border-gray-200 hover:border-[#E85D24] p-6 transition-all hover:shadow-md">
              <div className="text-3xl mb-3">{opt.emoji}</div>
              <div className="font-bold text-[#0F2044] mb-1">{opt.title}</div>
              <p className="text-sm text-[#6B7280]">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setType(null); setStep(1); }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0F2044]">
          <X size={14} /> Back
        </button>
        <h1 className="text-xl font-black text-[#0F2044]">Post a {type === 'local' ? 'Local' : 'Cross-Border'} Shipment</h1>
      </div>

      <div className="flex gap-1 mb-8 max-w-md">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#E85D24]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="sp1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-bold text-[#0F2044]">Step 1: Cargo Details</h2>
              <div><label className={labelCls}>Cargo type</label>
                <select className={inputCls} value={cargo} onChange={(e) => setCargo(e.target.value)}>
                  <option value="">Select...</option>
                  {CARGO_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Weight (tons)</label>
                <input type="number" className={inputCls} placeholder="e.g. 15" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Special requirements</label>
                <div className="space-y-2">
                  {specialOptions.map((s) => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={special.includes(s)} onChange={() => toggleSpecial(s)} className="w-4 h-4 rounded border-gray-300 text-[#E85D24]" />
                      <span className="text-sm text-[#0F2044]">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!cargo || !weight}
                className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40">Continue</button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="sp2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280]"><X size={12}/> Back</button>
              <h2 className="font-bold text-[#0F2044]">Step 2: Route Details</h2>
              {type === 'local' ? (
                <>
                  <div><label className={labelCls}>From (province + city)</label>
                    <input className={inputCls} placeholder="e.g. Gauteng, Johannesburg" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
                  <div><label className={labelCls}>To (province + city)</label>
                    <input className={inputCls} placeholder="e.g. Western Cape, Cape Town" value={to} onChange={(e) => setTo(e.target.value)} /></div>
                </>
              ) : (
                <>
                  <div><label className={labelCls}>From city</label><input className={inputCls} placeholder="Johannesburg" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
                  <div><label className={labelCls}>From country</label>
                    <select className={inputCls} value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                      {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>To city</label><input className={inputCls} placeholder="Lusaka" value={to} onChange={(e) => setTo(e.target.value)} /></div>
                  <div><label className={labelCls}>To country</label>
                    <select className={inputCls} value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                      <option value="">Select country...</option>
                      {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div><label className={labelCls}>Pickup date</label>
                <input type="date" className={inputCls} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} /></div>
              <button onClick={() => setStep(3)} disabled={!from || !to || !pickupDate}
                className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40">Continue</button>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="sp3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280]"><X size={12}/> Back</button>
              <h2 className="font-bold text-[#0F2044]">Step 3: Budget & Preferences</h2>
              <div><label className={labelCls}>Budget range</label>
                <select className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="">Select range...</option>
                  {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Additional notes</label>
                <textarea rows={3} className={inputCls + ' resize-none'} placeholder="Any special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="bg-[#FFF4EE] rounded-xl p-4 text-sm text-[#0F2044]">
                <span className="font-bold text-[#E85D24]">Commission: </span>BorderWatch charges 10% on confirmed shipment value only. Free to post.
              </div>
              <button onClick={() => setStep(4)} disabled={!budget}
                className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40">Continue</button>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="sp4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><X size={12}/> Back</button>
              <h2 className="font-bold text-[#0F2044] mb-4">Step 4: Review & Post</h2>
              <div className="bg-[#F8F9FA] rounded-xl p-5 space-y-2 mb-4 text-sm">
                <div><span className="text-[#6B7280]">Type:</span> <span className="font-medium text-[#0F2044]">{type === 'local' ? '🇿🇦 Local' : '🌍 Cross-Border'}</span></div>
                <div><span className="text-[#6B7280]">Cargo:</span> <span className="font-medium text-[#0F2044]">{cargo} · {weight}t</span></div>
                <div><span className="text-[#6B7280]">Route:</span> <span className="font-medium text-[#0F2044]">{from} → {to}</span></div>
                <div><span className="text-[#6B7280]">Pickup:</span> <span className="font-medium text-[#0F2044]">{pickupDate}</span></div>
                <div><span className="text-[#6B7280]">Budget:</span> <span className="font-medium text-[#0F2044]">{budget}</span></div>
                {special.length > 0 && <div><span className="text-[#6B7280]">Special:</span> <span className="font-medium text-[#0F2044]">{special.join(', ')}</span></div>}
              </div>
              <button onClick={() => setDone(true)}
                className="w-full bg-[#E85D24] text-white font-black py-3.5 rounded-xl hover:bg-[#d14f1a] transition-colors">
                Post Shipment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function CargoOwnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  let content: React.ReactNode;
  if (path === '/shipper') content = <ShipperHome />;
  else if (path === '/shipper/post') content = <PostShipmentPage />;
  else if (path === '/shipper/shipments') content = <ShipmentsPage />;
  else if (path === '/shipper/quotes') content = <QuotesPage />;
  else if (path === '/shipper/history') content = <ShipperHistory />;
  else if (path === '/shipper/payments') content = <ShipperPayments />;
  else content = <ShipperHome />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0F2044]">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-[#0F2044] text-sm">Cargo Owner Portal</span>
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
