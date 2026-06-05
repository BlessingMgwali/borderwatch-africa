import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ArrowRight, X, CheckCircle, AlertTriangle, Star, Clock } from 'lucide-react';
import { INDUSTRY_MAP, CARGO_TYPES, BUDGET_RANGES, SA_PROVINCES, AFRICAN_COUNTRIES, DRIVER_ROUTES, BORDERS } from '../config/data';
import { formatZAR, commissionRate } from '../config/payments';
import { useAuth } from '../context/AuthContext';

// ─── Mock data ────────────────────────────────────────────────────────────────

const LOCAL_LOADS = [
  { id: 'SHP-001', industry: 'Retail & FMCG', from: 'JHB (Gauteng)', to: 'Cape Town (Western Cape)', cargo: 'General Cargo', weight: 15, date: 'Tomorrow 08:00', budgetMin: 8000, budgetMax: 12000, shipper: 'Retail Distribution Co', postedAgo: '2h ago', urgent: false, special: [] },
  { id: 'SHP-002', industry: 'Cold Chain & Perishables', from: 'JHB (Gauteng)', to: 'Durban (KwaZulu-Natal)', cargo: 'Refrigerated Goods', weight: 8, date: 'Today 16:00', budgetMin: 4500, budgetMax: 6000, shipper: 'Fresh Produce SA', postedAgo: '30min ago', urgent: true, special: ['Reefer truck required'] },
  { id: 'SHP-003', industry: 'Construction & Infrastructure', from: 'Polokwane (Limpopo)', to: 'JHB (Gauteng)', cargo: 'Construction Materials', weight: 22, date: 'Friday', budgetMin: 5000, budgetMax: 8000, shipper: 'BuildSA Contractors', postedAgo: '4h ago', urgent: false, special: [] },
  { id: 'SHP-004', industry: 'Agriculture & Farming', from: 'Tzaneen (Limpopo)', to: 'Durban (KwaZulu-Natal)', cargo: 'Agricultural Produce', weight: 18, date: 'Thursday 07:00', budgetMin: 6000, budgetMax: 9000, shipper: 'Limpopo Farms', postedAgo: '1h ago', urgent: false, special: ['Reefer truck required'] },
  { id: 'SHP-005', industry: 'Manufacturing', from: 'East London (Eastern Cape)', to: 'JHB (Gauteng)', cargo: 'Automotive Parts', weight: 12, date: 'Next Monday', budgetMin: 7000, budgetMax: 11000, shipper: 'EL Motors', postedAgo: '6h ago', urgent: false, special: [] },
];

const CROSS_BORDER_LOADS = [
  { id: 'SHP-101', industry: 'Mining & Resources', from: 'JHB, South Africa', to: 'Lusaka, Zambia', cargo: 'Mining Equipment', weight: 32, date: 'Tomorrow 08:00', budgetMin: 15000, budgetMax: 30000, shipper: 'Copperbelt Mining', postedAgo: '1h ago', urgent: false, special: ['Hazmat certified driver'], border: 'Beitbridge', borderStatus: 'SEVERE', borderWait: '8h 20min', altBorder: 'Kazungula', altStatus: 'MODERATE', altWait: '3h 10min' },
  { id: 'SHP-102', industry: 'Agriculture & Farming', from: 'Cape Town, South Africa', to: 'Harare, Zimbabwe', cargo: 'Agricultural Produce', weight: 15, date: 'Friday 06:00', budgetMin: 12000, budgetMax: 18000, shipper: 'AgriSA Exports', postedAgo: '3h ago', urgent: false, special: ['Reefer truck required'], border: 'Beitbridge', borderStatus: 'SEVERE', borderWait: '8h 20min', altBorder: null, altStatus: null, altWait: null },
  { id: 'SHP-103', industry: 'Pharmaceutical & Medical', from: 'Durban, South Africa', to: 'Maputo, Mozambique', cargo: 'Pharmaceuticals', weight: 5, date: 'Monday 10:00', budgetMin: 8000, budgetMax: 14000, shipper: 'Aspen Pharma', postedAgo: '45min ago', urgent: true, special: ['GPS tracking required', 'Insurance required'], border: 'Lebombo', borderStatus: 'FLOWING', borderWait: '45 min', altBorder: null, altStatus: null, altWait: null },
  { id: 'SHP-104', industry: 'Government & NGO', from: 'JHB, South Africa', to: 'Gaborone, Botswana', cargo: 'General Cargo', weight: 10, date: 'Wednesday', budgetMin: 5000, budgetMax: 9000, shipper: 'USAID Botswana', postedAgo: '2h ago', urgent: false, special: [], border: 'Kopfontein', borderStatus: 'MODERATE', borderWait: '2h 10min', altBorder: null, altStatus: null, altWait: null },
];

// ─── Helper components ────────────────────────────────────────────────────────

function IndustryBadge({ industry, size = 'sm' }: { industry: string; size?: 'sm' | 'md' }) {
  const cfg = INDUSTRY_MAP[industry] ?? INDUSTRY_MAP['Other'];
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz}`} style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      <span>{cfg.emoji}</span> {cfg.label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'SEVERE' ? '#E24B4A' : status === 'MODERATE' ? '#F2A623' : '#1D9E75';
  return <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />;
}

// ─── Load card ────────────────────────────────────────────────────────────────

interface LoadCardProps { load: typeof LOCAL_LOADS[0] | typeof CROSS_BORDER_LOADS[0]; onQuote: (load: typeof LOCAL_LOADS[0]) => void; }

function LoadCard({ load, onQuote }: LoadCardProps) {
  const isCross = 'border' in load && load.border;
  const cbl = load as typeof CROSS_BORDER_LOADS[0];

  return (
    <motion.div whileHover={{ y: -2 }} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${load.urgent ? 'border-[#E24B4A]' : 'border-gray-100'}`}>
      {load.urgent && (
        <div className="bg-[#E24B4A] px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle size={13} className="text-white" />
          <span className="text-white text-xs font-bold">URGENT</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <IndustryBadge industry={load.industry} />
          {isCross ? <span className="text-xs bg-[#FFF4EE] text-[#E85D24] px-2 py-0.5 rounded-full font-bold">🌍 Cross-Border</span>
            : <span className="text-xs bg-[#EFF6FF] text-[#1E40AF] px-2 py-0.5 rounded-full font-bold">🇿🇦 Local</span>}
        </div>

        <div className="mb-3">
          <div className="font-black text-[#0F2044] text-base">{load.from}</div>
          <div className="flex items-center gap-1 text-[#6B7280] text-xs my-0.5">
            <ArrowRight size={12} />
          </div>
          <div className="font-black text-[#0F2044] text-base">{load.to}</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3 text-xs text-[#6B7280]">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">{load.cargo}</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">{load.weight}t</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1"><Clock size={11}/> {load.date}</span>
        </div>

        {load.special.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {load.special.map((s) => (
              <span key={s} className="text-xs bg-[#F2A623]/10 text-[#92400E] px-2 py-1 rounded-lg font-medium">⚠️ {s}</span>
            ))}
          </div>
        )}

        {isCross && cbl.border && (
          <div className="bg-[#F8F9FA] rounded-lg p-3 mb-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <StatusDot status={cbl.borderStatus!} />
              <span className="font-medium text-[#0F2044]">Via {cbl.border}</span>
              <span className="text-[#6B7280]">— {cbl.borderStatus} · {cbl.borderWait}</span>
            </div>
            {cbl.altBorder && (
              <div className="flex items-center gap-2">
                <StatusDot status={cbl.altStatus!} />
                <span className="font-medium text-[#1D9E75]">Via {cbl.altBorder}</span>
                <span className="text-[#6B7280]">— {cbl.altStatus} · {cbl.altWait} (recommended)</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-black text-[#0F2044]">{formatZAR(load.budgetMin)} – {formatZAR(load.budgetMax)}</div>
            <div className="text-xs text-[#6B7280]">Posted {load.postedAgo} · {load.shipper}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onQuote(load as typeof LOCAL_LOADS[0])}
            className="flex-1 bg-[#E85D24] text-white font-semibold py-2.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">
            Submit Quote
          </button>
          <button className="px-4 border border-gray-200 rounded-lg text-sm font-medium text-[#0F2044] hover:bg-gray-50 transition-colors">
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quote modal ──────────────────────────────────────────────────────────────

function QuoteModal({ load, onClose }: { load: typeof LOCAL_LOADS[0] | null; onClose: () => void }) {
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [departure, setDeparture] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!load) return null;
  const plan = user?.plan ?? 'starter';
  const rate = commissionRate(plan);
  const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
  const fee = Math.round(priceNum * rate);
  const receives = priceNum - fee;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
          <CheckCircle size={48} className="text-[#1D9E75] mx-auto mb-4" />
          <h3 className="text-xl font-black text-[#0F2044] mb-2">Quote Submitted!</h3>
          <p className="text-[#6B7280] mb-6">The cargo owner will be notified. You'll hear back within 2-4 hours.</p>
          <button onClick={onClose} className="w-full bg-[#0F2044] text-white font-semibold py-3 rounded-xl">Done</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-[#0F2044]">Submit Quote</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#0F2044]"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-sm text-[#6B7280] bg-[#F8F9FA] rounded-lg p-3">
            <span className="font-medium text-[#0F2044]">{load.from}</span> → <span className="font-medium text-[#0F2044]">{load.to}</span>
            <span className="ml-2 text-[#6B7280]">· {load.cargo} · {load.weight}t</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Your price (ZAR)</label>
            <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24]"
              placeholder="R 18,000" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Departure date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
              value={departure} onChange={(e) => setDeparture(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Message to shipper</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 resize-none"
              placeholder="Introduce your service..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {priceNum > 0 && (
            <div className="bg-[#F8F9FA] rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[#6B7280]">Your quote</span><span className="font-bold text-[#0F2044]">{formatZAR(priceNum)}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">Platform fee ({Math.round(rate * 100)}%)</span><span className="font-bold text-[#E24B4A]">−{formatZAR(fee)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="font-bold text-[#0F2044]">You receive</span><span className="font-black text-[#1D9E75]">{formatZAR(receives)}</span></div>
            </div>
          )}
          <button onClick={() => setSubmitted(true)} disabled={!price || !departure}
            className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl hover:bg-[#d14f1a] transition-colors disabled:opacity-40">
            Submit Quote
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Post shipment wizard ─────────────────────────────────────────────────────

function PostShipmentModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'local' | 'cross_border' | null>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  const [cargo, setCargo] = useState('');
  const [weight, setWeight] = useState('');
  const [special, setSpecial] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromCountry, setFromCountry] = useState('South Africa');
  const [toCountry, setToCountry] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  const specialOptions = ['Reefer/refrigerated truck', 'Hazmat certified driver', 'Abnormal load permit', 'Armed escort required', 'GPS tracking required', 'Insurance required'];
  const toggleSpecial = (s: string) => setSpecial((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const ref = `BW-SHP-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-[#1D9E75] mx-auto mb-4" />
          <h3 className="text-xl font-black text-[#0F2044] mb-2">Shipment Posted! ✅</h3>
          <p className="text-[#6B7280] mb-2">Reference: <span className="font-black text-[#0F2044]">{ref}</span></p>
          <p className="text-sm text-[#6B7280] mb-6">Transporters are being notified now. You should receive quotes within 2-4 hours.</p>
          <button onClick={onClose} className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl">View My Shipments</button>
        </motion.div>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#0F2044]">Post a Shipment</h3>
            <button onClick={onClose}><X size={20} className="text-[#6B7280]" /></button>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Is this shipment local or cross-border?</p>
          <div className="space-y-3">
            <button onClick={() => { setType('local'); setStep(1); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0F2044] transition-colors text-left">
              <span className="text-2xl">🇿🇦</span>
              <div><div className="font-bold text-[#0F2044]">Local — Within South Africa</div>
                <div className="text-xs text-[#6B7280]">Province to province delivery</div></div>
            </button>
            <button onClick={() => { setType('cross_border'); setStep(1); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#E85D24] transition-colors text-left">
              <span className="text-2xl">🌍</span>
              <div><div className="font-bold text-[#0F2044]">Cross-Border — SADC Countries</div>
                <div className="text-xs text-[#6B7280]">International freight across SADC</div></div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg my-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-[#0F2044]">Post a Shipment</h3>
            <p className="text-xs text-[#6B7280]">Step {step} of 4</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-[#6B7280]" /></button>
        </div>
        <div className="p-6">
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#E85D24]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h4 className="font-bold text-[#0F2044]">Cargo Details</h4>
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Cargo type</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                    value={cargo} onChange={(e) => setCargo(e.target.value)}>
                    <option value="">Select...</option>
                    {CARGO_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Weight (tons)</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                    type="number" placeholder="e.g. 15" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-2">Special requirements</label>
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
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-2"><X size={12}/> Back</button>
                <h4 className="font-bold text-[#0F2044]">Route Details</h4>
                {type === 'local' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">From (province + city)</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                        placeholder="e.g. Gauteng, Johannesburg" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">To (province + city)</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                        placeholder="e.g. Western Cape, Cape Town" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">From city</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                        placeholder="e.g. Johannesburg" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">From country</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none"
                        value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                        {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">To city</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                        placeholder="e.g. Lusaka" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F2044] mb-1.5">To country</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none"
                        value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                        <option value="">Select country...</option>
                        {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Pickup date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30"
                    value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
                <button onClick={() => setStep(3)} disabled={!from || !to || !pickupDate}
                  className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40">Continue</button>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-2"><X size={12}/> Back</button>
                <h4 className="font-bold text-[#0F2044]">Budget & Preferences</h4>
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Budget range</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none"
                    value={budget} onChange={(e) => setBudget(e.target.value)}>
                    <option value="">Select range...</option>
                    {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Additional notes</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none resize-none"
                    placeholder="Any special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="bg-[#FFF4EE] rounded-xl p-3 text-xs text-[#0F2044]">
                  <span className="font-bold text-[#E85D24]">Commission:</span> BorderWatch charges 10% on confirmed shipment value only. Free to post.
                </div>
                <button onClick={() => setStep(4)} disabled={!budget}
                  className="w-full bg-[#E85D24] text-white font-semibold py-3 rounded-xl disabled:opacity-40">Continue</button>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><X size={12}/> Back</button>
                <h4 className="font-bold text-[#0F2044] mb-4">Review & Post</h4>
                <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 mb-4 text-sm">
                  <div><span className="text-[#6B7280]">Type:</span> <span className="font-medium text-[#0F2044]">{type === 'local' ? '🇿🇦 Local' : '🌍 Cross-Border'}</span></div>
                  <div><span className="text-[#6B7280]">Cargo:</span> <span className="font-medium text-[#0F2044]">{cargo} · {weight}t</span></div>
                  <div><span className="text-[#6B7280]">Route:</span> <span className="font-medium text-[#0F2044]">{from} → {to}</span></div>
                  <div><span className="text-[#6B7280]">Pickup:</span> <span className="font-medium text-[#0F2044]">{pickupDate}</span></div>
                  <div><span className="text-[#6B7280]">Budget:</span> <span className="font-medium text-[#0F2044]">{budget}</span></div>
                </div>
                <p className="text-xs text-[#6B7280] mb-4">Platform commission: BorderWatch charges 10% on confirmed shipment value.</p>
                <button onClick={() => setDone(true)}
                  className="w-full bg-[#E85D24] text-white font-black py-3.5 rounded-xl hover:bg-[#d14f1a] transition-colors">
                  Post Shipment
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'local' | 'cross_border'>('local');
  const [quotingLoad, setQuotingLoad] = useState<typeof LOCAL_LOADS[0] | null>(null);
  const [showPost, setShowPost] = useState(false);
  const { user } = useAuth();

  const loads = activeTab === 'local' ? LOCAL_LOADS : CROSS_BORDER_LOADS;

  return (
    <div className="pt-16 min-h-screen bg-[#F8F9FA]">
      {/* Hero bar */}
      <div className="bg-[#0F2044] pt-8 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">Freight Marketplace</h1>
              <p className="text-white/70 text-sm mt-1">Find loads · Post shipments · Move smarter</p>
            </div>
            <button onClick={() => setShowPost(true)}
              className="bg-[#E85D24] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d14f1a] transition-colors text-sm flex items-center gap-2">
              + Post a Shipment
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[['local', '🇿🇦 Local Deliveries'], ['cross_border', '🌍 Cross-Border']].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white text-[#0F2044]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          <span className="text-[#6B7280]"><span className="font-bold text-[#0F2044]">{loads.length}</span> loads available</span>
          {user && <span className="text-[#6B7280]">Your commission rate: <span className="font-bold text-[#1D9E75]">{Math.round(commissionRate(user.plan ?? 'starter') * 100)}%</span></span>}
          <Link to="/register" className="text-[#E85D24] font-semibold hover:underline text-sm">
            {!user && 'Register to submit quotes →'}
          </Link>
        </div>

        {/* Load grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loads.map((load) => (
            <LoadCard key={load.id} load={load} onQuote={(l) => user ? setQuotingLoad(l) : null} />
          ))}
        </div>

        {!user && (
          <div className="mt-8 bg-[#0F2044] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-white mb-2">Register to Submit Quotes</h3>
            <p className="text-white/70 mb-6">Free to browse. Register as a transporter to submit quotes and win loads.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register" className="bg-[#E85D24] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d14f1a] transition-colors">
                Register as Transporter
              </Link>
              <Link to="/login" className="border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:border-white/60 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {quotingLoad && <QuoteModal load={quotingLoad} onClose={() => setQuotingLoad(null)} />}
        {showPost && <PostShipmentModal onClose={() => setShowPost(false)} />}
      </AnimatePresence>
    </div>
  );
}
