import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, ChevronRight, Star, TrendingDown, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, ResponsiveContainer,
} from 'recharts';

// ─── Data ────────────────────────────────────────────────────────────────────

const BORDER_CARDS = [
  { name: 'Beitbridge', countries: 'South Africa / Zimbabwe', status: 'SEVERE', wait: '8h 20min', pct: 90, updated: '6 min ago', pulse: true },
  { name: 'Kazungula', countries: 'South Africa / Botswana', status: 'MODERATE', wait: '3h 10min', pct: 55, updated: '12 min ago', pulse: false },
  { name: 'Lebombo', countries: 'South Africa / Mozambique', status: 'FLOWING', wait: '45 min', pct: 20, updated: '8 min ago', pulse: false },
  { name: 'Groblersbrug', countries: 'South Africa / Botswana', status: 'MODERATE', wait: '2h 40min', pct: 50, updated: '22 min ago', pulse: false },
  { name: 'Chirundu', countries: 'Zambia / Zimbabwe', status: 'FLOWING', wait: '1h 10min', pct: 30, updated: '5 min ago', pulse: false },
];

const FLEET_ROWS = [
  { id: 'BW-001', truck: 'Volvo FH16', route: 'JHB → Harare', statusLabel: 'AT BORDER', statusColor: '#E24B4A', detail: 'Beitbridge · Delayed 8h 20min' },
  { id: 'BW-002', truck: 'Mercedes Actros', route: 'Durban → Lusaka', statusLabel: 'IN TRANSIT', statusColor: '#1D9E75', detail: 'ETA Chirundu: 16:45' },
  { id: 'BW-003', truck: 'Scania R450', route: 'Cape Town → JHB', statusLabel: 'DELIVERED', statusColor: '#6B7280', detail: 'Completed 09:12' },
  { id: 'BW-004', truck: 'DAF XF', route: 'JHB → Maputo', statusLabel: 'IN TRANSIT', statusColor: '#1D9E75', detail: 'ETA Lebombo: 15:20' },
];

const LOADS = [
  { from: 'JHB', to: 'Harare', weight: '32t General Cargo', date: 'Today 14:00', price: 'R18,400', match: 97, matchColor: '#1D9E75', shipper: 'Zimtrade Exports' },
  { from: 'Durban', to: 'Lusaka', weight: '28t Mining Equipment', date: 'Tomorrow 08:00', price: 'R22,100', match: 84, matchColor: '#F2A623', shipper: 'Copperbelt Mining Supplies' },
  { from: 'Musina', to: 'Maputo', weight: '15t Agricultural Refrigerated', date: 'Friday 06:00', price: 'R9,800', match: 78, matchColor: '#F2A623', shipper: 'Fresh Produce SA' },
];

const ANALYTICS_DATA = [
  { month: 'Jan', wait: 420 },
  { month: 'Feb', wait: 380 },
  { month: 'Mar', wait: 310 },
  { month: 'Apr', wait: 290 },
  { month: 'May', wait: 210 },
  { month: 'Jun', wait: 180 },
];

const KPI_CARDS = [
  { value: 'R2.4M', label: 'Annual fuel savings', badge: '↑ 18% vs last year' },
  { value: '1,847 hrs', label: 'Border delays avoided', badge: '↓ 34% reduction' },
  { value: '89%', label: 'Fleet utilization rate', badge: '↑ 12pts above industry' },
  { value: '23%', label: 'Revenue increase', badge: '↓ Deadhead from 40% to 12%' },
];

const TESTIMONIALS = [
  {
    name: 'Themba Ndlovu',
    title: 'Operations Director',
    company: 'Ndlovu Transport Group',
    quote: 'We cut our Beitbridge waiting costs by R180,000 in the first quarter. The AI route suggestions paid for three years of subscription in 90 days.',
    fleet: '38-truck fleet',
    initials: 'TN',
  },
  {
    name: 'Sarah van der Merwe',
    title: 'Senior Freight Broker',
    company: 'Meridian Logistics Solutions',
    quote: 'BorderWatch gives me border intelligence before my clients even know there\'s a problem. Non-negotiable.',
    fleet: '200+ loads/month',
    initials: 'SV',
  },
  {
    name: 'Emmanuel Chikwanda',
    title: 'Fleet Manager',
    company: 'Copperbelt Hauliers Ltd',
    quote: 'Empty load matching changed our business. Deadhead down from 40% to 12%. That is pure profit.',
    fleet: '55-truck fleet',
    initials: 'EC',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(s: string) {
  if (s === 'SEVERE') return { bg: '#E24B4A', border: '#E24B4A', text: '#E24B4A' };
  if (s === 'MODERATE') return { bg: '#F2A623', border: '#F2A623', text: '#F2A623' };
  return { bg: '#1D9E75', border: '#1D9E75', text: '#1D9E75' };
}

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

function StatChip({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-[#0F2044] leading-tight">{number}</span>
      <span className="text-xs text-[#6B7280] mt-0.5">{label}</span>
    </div>
  );
}

// ─── Map Panel ───────────────────────────────────────────────────────────────

function MapPanel() {
  return (
    <div className="bg-[#0F2044] rounded-2xl p-5 h-full min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85D24] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E85D24]"></span>
          </span>
          <span className="text-white text-sm font-medium">Live network · Southern Africa</span>
        </div>
        <span className="text-[#6B7280] text-xs font-mono">UPDATED 12S AGO</span>
      </div>

      {/* SVG Map */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 400 420" className="w-full h-full" style={{ maxHeight: 360 }}>
          {/* Southern Africa outline — simplified */}
          <path
            d="M120,30 L280,30 L320,80 L350,140 L360,200 L340,260 L300,310 L260,360 L220,400 L200,410 L180,400 L140,360 L100,310 L60,260 L40,200 L50,140 L80,80 Z"
            fill="#1a3060"
            stroke="#2a4070"
            strokeWidth="1.5"
          />
          {/* Internal country borders */}
          <path d="M120,30 L280,30 L300,100 L120,100 Z" fill="#162850" stroke="#2a4070" strokeWidth="0.5" opacity="0.7"/>
          <path d="M80,160 L320,160" stroke="#2a4070" strokeWidth="0.5"/>
          <path d="M90,240 L310,240" stroke="#2a4070" strokeWidth="0.5"/>
          <path d="M200,30 L200,410" stroke="#2a4070" strokeWidth="0.5" opacity="0.4"/>

          {/* Animated dashed route: JHB → Beitbridge */}
          <path
            d="M195,330 L210,260 L218,220"
            stroke="#E85D24"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="8 5"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="200"
              to="0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Johannesburg dot */}
          <circle cx="195" cy="335" r="5" fill="#E85D24"/>
          <text x="203" y="339" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">JHB</text>

          {/* Border dots */}
          {/* Beitbridge */}
          <circle cx="218" cy="220" r="6" fill="#E24B4A" opacity="0.9"/>
          <circle cx="218" cy="220" r="12" fill="#E24B4A" opacity="0.15">
            <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="228" y="223" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">Beitbridge</text>

          {/* Kazungula */}
          <circle cx="155" cy="175" r="5" fill="#F2A623"/>
          <text x="162" y="178" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">Kazungula</text>

          {/* Lebombo */}
          <circle cx="290" cy="248" r="5" fill="#F2A623"/>
          <text x="298" y="251" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">Lebombo</text>

          {/* Groblersbrug */}
          <circle cx="175" cy="248" r="5" fill="#F2A623"/>
          <text x="115" y="245" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">Groblersbrug</text>

          {/* Chirundu */}
          <circle cx="210" cy="165" r="5" fill="#1D9E75"/>
          <text x="218" y="168" fill="#94a3b8" fontSize="9" fontFamily="Inter,sans-serif">Chirundu</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/10">
        {[{ color: '#E24B4A', label: 'Severe' }, { color: '#F2A623', label: 'Moderate' }, { color: '#1D9E75', label: 'Flowing' }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Border Card ──────────────────────────────────────────────────────────────

function BorderCard({ card }: { card: typeof BORDER_CARDS[0] }) {
  const col = statusColor(card.status);
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden"
      style={{ borderLeft: `4px solid ${col.border}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[#0F2044] text-sm">{card.name}</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{card.countries}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {card.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: col.bg }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: col.bg }}></span>
            </span>
          )}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: col.text, backgroundColor: `${col.bg}15` }}>
            {card.status}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xl font-bold text-[#0F2044]">{card.wait}</div>
        <div className="text-xs text-[#6B7280]">Average wait</div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${card.pct}%`, backgroundColor: col.bg }}></div>
      </div>

      <p className="text-xs text-[#6B7280]">Updated {card.updated}</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'loads' | 'trucks'>('loads');

  return (
    <div className="pt-16">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-white min-h-[calc(100vh-64px)] flex items-center py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-[#FFF4EE] border border-[#E85D24]/20 rounded-full px-4 py-1.5 mb-8">
                <span className="w-2 h-2 bg-[#E85D24] rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-[#E85D24]">Live across 18 Southern African border posts</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-[#0F2044] leading-[1.08] mb-6 tracking-tight">
                See Border Delays<br />
                <span className="text-[#E85D24]">Before They Cost</span><br />
                You Money.
              </h1>

              <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-xl">
                Real-time border intelligence, fleet visibility, and freight opportunities across Southern Africa — engineered for transport operators who move at the speed of trade.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#E85D24] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm"
                >
                  Start free trial <ArrowRight size={16} />
                </Link>
                <button className="inline-flex items-center gap-2 border-2 border-[#0F2044] text-[#0F2044] font-semibold px-6 py-3 rounded-lg hover:bg-[#0F2044] hover:text-white transition-colors text-sm">
                  <Play size={15} className="fill-current" /> Book a demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <StatChip number="42,000+" label="Truck movements monitored" />
                <div className="w-px bg-gray-200 self-stretch"></div>
                <StatChip number="18" label="Border posts covered" />
                <div className="w-px bg-gray-200 self-stretch"></div>
                <StatChip number="3.2M+" label="Freight events processed" />
                <div className="w-px bg-gray-200 self-stretch"></div>
                <StatChip number="95%" label="Prediction accuracy" />
              </div>
            </motion.div>

            {/* Right — map panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <MapPanel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Border Status ──────────────────────────────────────────── */}
      <section id="borders" className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">Live Border Monitoring</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-3">Know Before You Go.</h2>
            <p className="text-[#6B7280] text-lg mb-10">Live status from 18 major border posts, updated every 15 minutes.</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {BORDER_CARDS.map((card) => <BorderCard key={card.name} card={card} />)}
            </div>
          </FadeUp>

          {/* AI suggestion banner */}
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FFF4EE] border-l-4 border-[#E85D24] rounded-xl p-5">
              <div className="flex-1">
                <span className="text-xs font-bold text-[#E85D24] uppercase tracking-wider">AI Route Intelligence</span>
                <p className="text-sm text-[#0F2044] mt-1">
                  Beitbridge has an 8h 20min wait today. Routing via Kazungula could save approximately 5 hours on the JHB → Harare corridor. Estimated fuel saving: <strong>R420 per trip.</strong>
                </p>
              </div>
              <button className="flex-shrink-0 border-2 border-[#E85D24] text-[#E85D24] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#E85D24] hover:text-white transition-colors whitespace-nowrap">
                View Route →
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Fleet Visibility ───────────────────────────────────────── */}
      <section id="fleet" className="bg-[#F8F9FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <FadeUp>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">Fleet Management</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-4">Know Where Every Truck Is, Right Now.</h2>
              <p className="text-[#6B7280] text-base leading-relaxed mb-8">
                Track your entire fleet across Southern Africa in real time. See which trucks are at borders, which are in transit, and which are sitting idle.
              </p>
              <ul className="space-y-3">
                {[
                  'Live GPS tracking across all SADC countries',
                  'Automatic border arrival and departure alerts',
                  'ETA predictions updated every 5 minutes',
                  'Driver check-in and condition reporting',
                  'Geofencing alerts for sensitive zones',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                    <span className="text-[#0F2044] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Right — Fleet mockup */}
            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="bg-[#0F2044] px-5 py-4 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">My Fleet · 6 Vehicles</span>
                  <span className="bg-[#1D9E75] text-white text-xs font-bold px-2.5 py-1 rounded-full">LIVE</span>
                </div>
                <div className="bg-white divide-y divide-gray-50">
                  {FLEET_ROWS.map((row) => (
                    <div key={row.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-[#0F2044]">{row.id}</span>
                          <span className="text-xs text-[#6B7280]">· {row.truck}</span>
                        </div>
                        <div className="text-sm font-medium text-[#0F2044] truncate">{row.route}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold mb-0.5" style={{ color: row.statusColor }}>{row.statusLabel}</div>
                        <div className="text-xs text-[#6B7280]">{row.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-[#6B7280]">
                    Showing 4 of 6 vehicles ·{' '}
                    <Link to="/dashboard" className="text-[#E85D24] font-medium hover:underline">View full fleet →</Link>
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Freight Marketplace ────────────────────────────────────── */}
      <section id="marketplace" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">Freight Marketplace</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-3">Never Drive Empty Again.</h2>
            <p className="text-[#6B7280] text-lg mb-8">
              Post your available capacity, browse freight opportunities, and get AI-matched to the best loads on your route.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['loads', 'trucks'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-[#0F2044] text-white'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  {tab === 'loads' ? 'Available Loads' : 'Available Trucks'}
                </button>
              ))}
            </div>

            {/* Load cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {LOADS.map((load) => (
                <div key={load.from + load.to} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#0F2044] text-base">{load.from} → {load.to}</div>
                      <div className="text-xs text-[#6B7280] mt-0.5">{load.weight}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: load.matchColor, backgroundColor: `${load.matchColor}15` }}
                      >
                        {load.match}% match
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-black text-[#0F2044]">{load.price}</span>
                    <span className="text-xs text-[#6B7280]">{load.date}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-4">{load.shipper}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#E85D24] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#d14f1a] transition-colors">
                      Request Load
                    </button>
                    <button className="text-sm font-medium text-[#0F2044] hover:text-[#E85D24] px-3 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-[#6B7280]">
              Showing 3 of 247 available loads ·{' '}
              <Link to="/dashboard" className="text-[#E85D24] font-medium hover:underline">View all →</Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Analytics ──────────────────────────────────────────────── */}
      <section id="platform" className="bg-[#F8F9FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">Proven Results</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-10">Measure Every Rand Saved.</h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {KPI_CARDS.map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="text-3xl font-black text-[#0F2044] mb-1">{kpi.value}</div>
                  <div className="text-sm text-[#6B7280] mb-3">{kpi.label}</div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                    {kpi.badge}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#0F2044] mb-1 text-base">Beitbridge Average Wait Time — Sample Fleet</h3>
              <p className="text-sm text-[#6B7280] mb-6">Minutes — Jan to Jun 2025</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ANALYTICS_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E85D24" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#E85D24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false}/>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(v: number) => [`${v} min`, 'Wait time']}
                  />
                  <Area type="monotone" dataKey="wait" stroke="#E85D24" strokeWidth={2.5} fill="url(#waitGrad)" dot={{ fill: '#E85D24', r: 4 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section id="customers" className="bg-[#F8F9FA] py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-12 text-center">
              Trusted by Logistics Leaders Across Africa.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={15} className="fill-[#E85D24] text-[#E85D24]" />
                    ))}
                  </div>
                  <blockquote className="text-[#0F2044] text-sm leading-relaxed italic mb-6 flex-1">
                    "{t.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F2044] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{t.initials}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F2044] text-sm">{t.name}</div>
                      <div className="text-xs text-[#6B7280]">{t.title}</div>
                      <div className="text-xs text-[#6B7280]">{t.company}</div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">{t.fleet}</span>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#0F2044] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Move Smarter?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join 1,200+ transport operators already using BorderWatch Africa. Start your 14-day free trial today.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#E85D24] text-white font-semibold px-7 py-3 rounded-lg hover:bg-[#d14f1a] transition-colors"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <button className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-7 py-3 rounded-lg hover:border-white/60 transition-colors">
                <Play size={15} className="fill-current" /> Book a demo
              </button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
