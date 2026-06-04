import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Shield, Truck, Package, BarChart3, Bell, Settings,
  AlertTriangle, TrendingUp, MapPin, ChevronRight, Menu, X,
} from 'lucide-react';

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
  { label: 'Active Trucks', value: '4', sub: '2 in transit', color: '#0F2044', bgColor: '#EEF2FF' },
  { label: 'At Borders', value: '1', sub: 'Beitbridge · Delayed', color: '#F2A623', bgColor: '#FFFBEB' },
  { label: 'Load Matches', value: '7', sub: 'New today', color: '#E85D24', bgColor: '#FFF4EE' },
  { label: 'Fuel Savings', value: 'R14,200', sub: 'This month', color: '#1D9E75', bgColor: '#F0FDF4' },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Border Status', icon: Shield, href: '/dashboard/borders' },
  { label: 'My Fleet', icon: Truck, href: '/dashboard/fleet' },
  { label: 'Freight Marketplace', icon: Package, href: '/dashboard/marketplace' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Alerts', icon: Bell, href: '/dashboard/alerts', badge: 3 },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const QUICK_ACTIONS = [
  { label: 'Report Border Condition', icon: Shield, color: '#E85D24' },
  { label: 'Post Available Truck', icon: Truck, color: '#0F2044' },
  { label: 'Find a Load', icon: Package, color: '#1D9E75' },
  { label: 'View Route Intelligence', icon: BarChart3, color: '#F2A623' },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0F2044] z-40 flex flex-col transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
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
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon, href, badge }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={label}
                to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-[#E85D24] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-[#E24B4A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-[#E85D24] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">TN</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Themba Ndlovu</div>
              <span className="inline-block bg-[#E85D24]/20 text-[#E85D24] text-xs font-medium px-1.5 py-0.5 rounded mt-0.5">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0F2044]">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-[#0F2044] text-sm">Dashboard</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Trial banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#E85D24] rounded-xl px-5 py-3.5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <p className="text-white text-sm font-medium">
              <span className="font-bold">14-day free trial active</span> — 11 days remaining. Upgrade to unlock all features.
            </p>
            <Link
              to="/pricing"
              className="flex-shrink-0 bg-white text-[#E85D24] text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Upgrade Now
            </Link>
          </motion.div>

          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#0F2044]">Good morning, Themba</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{today}</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {KPI_CARDS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="text-xs text-[#6B7280] mb-2 font-medium">{kpi.label}</div>
                <div className="text-2xl font-black mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs text-[#6B7280]">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Border status mini */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-[#0F2044] text-sm">Border Status</h2>
                <Link to="/dashboard/borders" className="text-xs text-[#E85D24] hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {BORDER_MINI.map((b) => (
                  <div key={b.name} className="flex items-center px-5 py-3 gap-3 hover:bg-gray-50 transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }}></span>
                    <span className="text-sm font-medium text-[#0F2044] flex-1">{b.name}</span>
                    <span className="text-xs font-semibold" style={{ color: b.color }}>{b.status}</span>
                    <span className="text-xs text-[#6B7280] w-16 text-right">{b.wait}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-[#0F2044] text-sm flex items-center gap-2">
                  Recent Alerts
                  <span className="bg-[#E24B4A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                </h2>
                <Link to="/dashboard/alerts" className="text-xs text-[#E85D24] hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {ALERTS.map((alert, i) => (
                  <div key={i} className="px-5 py-3.5 flex gap-3 hover:bg-gray-50 transition-colors">
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

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold text-[#0F2044] mb-3 text-sm">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${qa.color}15` }}>
                    <qa.icon size={20} style={{ color: qa.color }} />
                  </div>
                  <span className="text-xs font-semibold text-[#0F2044] leading-tight">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
