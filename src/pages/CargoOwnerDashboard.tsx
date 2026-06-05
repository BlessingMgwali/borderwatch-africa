import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, List, MessageSquare, History, CreditCard, Settings, Menu, X, Plus, CheckCircle, Star, ChevronRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, Shipment, Quote } from '../lib/supabase';
import { INDUSTRY_MAP, CARGO_TYPES, BUDGET_RANGES, AFRICAN_COUNTRIES, DRIVER_ROUTES } from '../config/data';
import { formatZAR, commissionRate, platformFee, carrierReceives } from '../config/payments';

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
            <button onClick={signOut} className="text-white/40 hover:text-white text-xs">Out</button>
          </div>
        </div>
      </aside>
    </>
  );
}


// ─── Sub-pages ─────────────────────────────────────────────────────────────────

function ShipperHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ active: 0, quotes: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: shipments } = await supabase.from('shipments').select('id, status').eq('shipper_id', user.id);
      if (shipments) {
        const active = (shipments as { status: string }[]).filter((s) => ['open', 'quoted', 'confirmed', 'in_transit'].includes(s.status)).length;
        const completed = (shipments as { status: string }[]).filter((s) => s.status === 'delivered').length;
        const shipmentIds = (shipments as { id: string }[]).map((s) => s.id);
        const { count } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).in('shipment_id', shipmentIds).eq('status', 'pending');
        setKpis({ active, quotes: count ?? 0, completed });
      }
    })();
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F2044]">Good morning, {user?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{user?.companyName ?? 'Cargo Owner'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Shipments', value: String(kpis.active), color: '#0F2044' },
          { label: 'Pending Quotes', value: String(kpis.quotes), color: '#E85D24' },
          { label: 'Completed This Month', value: String(kpis.completed), color: '#1D9E75' },
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
          <h2 className="font-bold text-[#0F2044]">Quick Actions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: 'View My Shipments', path: '/shipper/shipments', color: '#0F2044' },
            { label: 'Review Active Quotes', path: '/shipper/quotes', color: '#E85D24' },
            { label: 'Shipment History', path: '/shipper/history', color: '#1D9E75' },
          ].map((a) => (
            <Link key={a.label} to={a.path} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
              <p className="text-sm text-[#0F2044] flex-1">{a.label}</p>
              <ChevronRight size={14} className="text-[#6B7280]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('shipments').select('*')
      .eq('shipper_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setShipments((data ?? []) as Shipment[]); setLoading(false); });
  }, [user]);

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    open: { label: 'Open', color: '#1D9E75', bg: '#F0FDF4' },
    quoted: { label: 'Quoted', color: '#E85D24', bg: '#FFF4EE' },
    confirmed: { label: 'Confirmed', color: '#0369A1', bg: '#F0F9FF' },
    in_transit: { label: 'In Transit', color: '#0369A1', bg: '#F0F9FF' },
    delivered: { label: 'Delivered', color: '#6B7280', bg: '#F3F4F6' },
    cancelled: { label: 'Cancelled', color: '#E24B4A', bg: '#FEF2F2' },
    disputed: { label: 'Disputed', color: '#E24B4A', bg: '#FEF2F2' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#0F2044]">My Shipments</h1>
        <Link to="/shipper/post" className="bg-[#E85D24] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#d14f1a] transition-colors flex items-center gap-2">
          <Plus size={15} /> Post Shipment
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">Loading shipments...</div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-[#0F2044] mb-2">No shipments yet</h2>
          <p className="text-sm text-[#6B7280] mb-4">Post your first shipment to start receiving quotes.</p>
          <Link to="/shipper/post" className="bg-[#E85D24] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">Post a Shipment</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Reference', 'Cargo', 'Route', 'Weight', 'Industry', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shipments.map((s) => {
                  const st = statusMap[s.status] ?? statusMap.open;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-[#0F2044]">{s.reference}</td>
                      <td className="px-5 py-3.5 text-sm text-[#0F2044] font-medium whitespace-nowrap">{s.cargo_type}</td>
                      <td className="px-5 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{s.from_location} → {s.to_location}</td>
                      <td className="px-5 py-3.5 text-sm text-[#6B7280]">{s.weight_tons ? `${s.weight_tons}t` : '—'}</td>
                      <td className="px-5 py-3.5">{s.industry ? <IndustryBadge industry={s.industry} /> : <span className="text-xs text-[#6B7280]">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {(s.status === 'open' || s.status === 'quoted') && (
                          <Link to="/shipper/quotes" className="text-xs text-[#E85D24] font-semibold hover:underline">View Quotes</Link>
                        )}
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

function QuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<(Quote & { shipment: Shipment | null; carrier_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptDone, setAcceptDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Load quotes on shipments owned by this user
      const { data: shipmentData } = await supabase
        .from('shipments').select('id, reference, cargo_type, from_location, to_location, weight_tons, industry')
        .eq('shipper_id', user.id).in('status', ['open', 'quoted']);

      if (!shipmentData || shipmentData.length === 0) { setLoading(false); return; }

      const shipmentIds = shipmentData.map((s: Shipment) => s.id);
      const { data: quotesData } = await supabase
        .from('quotes').select('*').in('shipment_id', shipmentIds).order('price_zar', { ascending: true });

      if (!quotesData) { setLoading(false); return; }

      const carrierIds = [...new Set((quotesData as Quote[]).map((q) => q.carrier_id))];
      const { data: profilesData } = await supabase
        .from('profiles').select('id, full_name, company_name, plan, verified').in('id', carrierIds);

      const profileMap = new Map((profilesData ?? []).map((p: { id: string; full_name: string; company_name: string | null; plan: string; verified: boolean }) => [p.id, p]));
      const shipmentMap = new Map((shipmentData as Shipment[]).map((s) => [s.id, s]));

      setQuotes((quotesData as Quote[]).map((q) => ({
        ...q,
        shipment: shipmentMap.get(q.shipment_id) ?? null,
        carrier_name: (profileMap.get(q.carrier_id) as { full_name: string; company_name: string | null } | undefined)?.company_name ?? (profileMap.get(q.carrier_id) as { full_name: string } | undefined)?.full_name ?? 'Carrier',
      })));
      setLoading(false);
    })();
  }, [user]);

  async function acceptQuote(quoteId: string) {
    setAccepting(quoteId);
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
    setAcceptDone(true);
    setAccepting(null);
  }

  async function declineQuote(quoteId: string) {
    await supabase.from('quotes').update({ status: 'declined' }).eq('id', quoteId);
    setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
  }

  if (acceptDone) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <CheckCircle size={64} className="text-[#1D9E75] mb-4" />
        <h2 className="text-2xl font-black text-[#0F2044] mb-2">Booking Confirmed!</h2>
        <p className="text-[#6B7280] mb-6">The carrier has been notified and will contact you shortly.</p>
        <Link to="/shipper/shipments" className="bg-[#E85D24] text-white font-semibold px-6 py-3 rounded-xl">View My Shipments</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Active Quotes</h1>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">Loading quotes...</div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-[#0F2044] mb-2">No quotes yet</h2>
          <p className="text-sm text-[#6B7280]">Post a shipment to start receiving quotes from carriers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const fee = platformFee(Number(q.price_zar), user?.plan ?? 'starter');
            const carrier = carrierReceives(Number(q.price_zar), user?.plan ?? 'starter');
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                {q.shipment && (
                  <div className="text-xs text-[#6B7280] mb-3 font-medium">
                    Shipment: {q.shipment.reference} · {q.shipment.from_location} → {q.shipment.to_location} · {q.shipment.cargo_type}
                  </div>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0F2044] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{q.carrier_name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#0F2044]">{q.carrier_name}</div>
                      <div className="text-xs text-[#6B7280] mt-0.5">Submitted {new Date(q.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#0F2044]">{formatZAR(Number(q.price_zar))}</div>
                    <div className="text-xs text-[#6B7280]">Platform fee: {formatZAR(fee)} · You pay: {formatZAR(Number(q.price_zar) + fee)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-3 text-sm text-[#6B7280]">
                  {q.departure_date && <span>Departs: <span className="font-medium text-[#0F2044]">{q.departure_date}</span></span>}
                  {q.eta_date && <span>ETA: <span className="font-medium text-[#0F2044]">{q.eta_date}</span></span>}
                </div>

                {q.message && <p className="text-sm text-[#6B7280] italic mb-4">"{q.message}"</p>}

                {q.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => acceptQuote(q.id)} disabled={accepting === q.id}
                      className="flex-1 bg-[#E85D24] text-white font-semibold py-2.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm disabled:opacity-60">
                      {accepting === q.id ? 'Accepting...' : 'Accept Quote'}
                    </button>
                    <button onClick={() => declineQuote(q.id)}
                      className="px-4 border border-gray-200 rounded-lg text-sm font-medium text-[#E24B4A] hover:bg-[#E24B4A]/5">
                      Decline
                    </button>
                  </div>
                )}
                {q.status === 'accepted' && (
                  <span className="inline-block bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-3 py-1.5 rounded-full">Accepted</span>
                )}
                {q.status === 'declined' && (
                  <span className="inline-block bg-gray-100 text-[#6B7280] text-xs font-bold px-3 py-1.5 rounded-full">Declined</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShipperHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('shipments').select('*')
      .eq('shipper_id', user.id).eq('status', 'delivered')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setHistory((data ?? []) as Shipment[]); setLoading(false); });
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Shipment History</h1>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">Loading...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <History size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">No completed shipments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-[#6B7280] mb-1">{s.reference}</div>
                <div className="font-bold text-[#0F2044]">{s.from_location} → {s.to_location}</div>
                <div className="text-sm text-[#6B7280] mt-0.5">{s.cargo_type}{s.weight_tons ? ` · ${s.weight_tons}t` : ''}</div>
                {s.industry && <div className="mt-2"><IndustryBadge industry={s.industry} /></div>}
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
      )}
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
  const { user } = useAuth();
  const [type, setType] = useState<'local' | 'cross_border' | null>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newRef, setNewRef] = useState('');
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

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] bg-white';
  const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

  async function handlePost() {
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');
    const ref = `BW-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('shipments').insert({
      reference: ref,
      shipper_id: user.id,
      shipment_type: type,
      cargo_type: cargo,
      weight_tons: weight ? parseFloat(weight) : null,
      special_requirements: special,
      from_location: from,
      to_location: to,
      from_country: type === 'cross_border' ? fromCountry : 'South Africa',
      to_country: type === 'cross_border' ? toCountry : null,
      pickup_date: pickupDate || null,
      budget_range: budget,
      notes: notes || null,
      status: 'open',
    });
    setSubmitting(false);
    if (error) { setSubmitError(error.message); return; }
    setNewRef(ref);
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <CheckCircle size={64} className="text-[#1D9E75] mb-4" />
        <h2 className="text-2xl font-black text-[#0F2044] mb-2">Shipment Posted!</h2>
        <p className="text-[#6B7280] mb-2">Reference: <span className="font-black text-[#0F2044]">{newRef}</span></p>
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
                <div><span className="text-[#6B7280]">Type:</span> <span className="font-medium text-[#0F2044]">{type === 'local' ? 'Local' : 'Cross-Border'}</span></div>
                <div><span className="text-[#6B7280]">Cargo:</span> <span className="font-medium text-[#0F2044]">{cargo} · {weight}t</span></div>
                <div><span className="text-[#6B7280]">Route:</span> <span className="font-medium text-[#0F2044]">{from} → {to}</span></div>
                <div><span className="text-[#6B7280]">Pickup:</span> <span className="font-medium text-[#0F2044]">{pickupDate}</span></div>
                <div><span className="text-[#6B7280]">Budget:</span> <span className="font-medium text-[#0F2044]">{budget}</span></div>
                {special.length > 0 && <div><span className="text-[#6B7280]">Special:</span> <span className="font-medium text-[#0F2044]">{special.join(', ')}</span></div>}
              </div>
              {submitError && <div className="text-[#E24B4A] text-sm mb-3">{submitError}</div>}
              <button onClick={handlePost} disabled={submitting}
                className="w-full bg-[#E85D24] text-white font-black py-3.5 rounded-xl hover:bg-[#d14f1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</> : 'Post Shipment'}
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
