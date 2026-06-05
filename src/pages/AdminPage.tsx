import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, CreditCard, TrendingUp, Megaphone, Shield, Bell,
  Sparkles, Settings, Menu, X, Users, AlertOctagon, MapPin, FileText, DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { formatZAR } from '../config/payments';
import { INDUSTRY_MAP } from '../config/data';

// ─── Admin nav ────────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Companies', icon: Building2, path: '/admin/companies' },
  { label: 'Drivers', icon: Users, path: '/admin/drivers' },
  { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
  { label: 'Revenue', icon: TrendingUp, path: '/admin/revenue' },
  { label: 'Marketplace', icon: Shield, path: '/admin/marketplace' },
  { label: 'Disputes', icon: AlertOctagon, path: '/admin/disputes' },
  { label: 'Advertising', icon: Megaphone, path: '/admin/advertising' },
  { label: 'Borders', icon: MapPin, path: '/admin/borders' },
  { label: 'Platform Alerts', icon: Bell, path: '/admin/alerts' },
  { label: 'Intelligence', icon: Sparkles, path: '/admin/intelligence' },
  { label: 'Reports', icon: FileText, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0A1628] z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E85D24] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="9" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">BorderWatch</div>
              <div className="text-[#E85D24] text-xs font-bold">SUPER ADMIN</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white"><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {ADMIN_NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link key={label} to={path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#E85D24] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-[#E85D24] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0) ?? 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name ?? 'Admin'}</div>
              <div className="text-xs text-[#E85D24]">Super Admin</div>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-white text-xs">Out</button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

const REVENUE_TREND = [
  { month: 'Jan', subscriptions: 35800, commissions: 18200, ads: 8000 },
  { month: 'Feb', subscriptions: 38200, commissions: 21500, ads: 9200 },
  { month: 'Mar', subscriptions: 41500, commissions: 24800, ads: 10000 },
  { month: 'Apr', subscriptions: 44200, commissions: 26100, ads: 10800 },
  { month: 'May', subscriptions: 46800, commissions: 28400, ads: 11600 },
  { month: 'Jun', subscriptions: 48431, commissions: 28400, ads: 12000 },
];

const INDUSTRY_DATA = [
  { name: 'Mining', value: 28, color: '#374151' },
  { name: 'Agriculture', value: 22, color: '#166534' },
  { name: 'Retail', value: 18, color: '#1E40AF' },
  { name: 'Construction', value: 12, color: '#92400E' },
  { name: 'Other', value: 20, color: '#6B7280' },
];

function AdminOverview() {
  const KPIs = [
    { label: 'Total Companies', value: '47', color: '#0F2044' },
    { label: 'Paid Subscribers', value: '31', color: '#E85D24' },
    { label: 'Active Drivers', value: '142', color: '#1D9E75' },
    { label: 'Total MRR', value: 'R87,031', color: '#E85D24' },
    { label: 'Active Shipments', value: '89', color: '#0F2044' },
    { label: 'Open Disputes', value: '3', color: '#E24B4A' },
    { label: 'Border Reports Today', value: '89', color: '#1D9E75' },
    { label: 'Accuracy Rate', value: '94%', color: '#F2A623' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F2044]">Platform Overview</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">BorderWatch Africa — Super Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIs.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-2">{kpi.label}</div>
            <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-[#0F2044] mb-1">Revenue Breakdown — Last 6 Months</h2>
        <p className="text-sm text-[#6B7280] mb-6">Subscriptions · Commissions · Advertising</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={REVENUE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v) => [formatZAR(Number(v)), '']} />
            <Bar dataKey="subscriptions" name="Subscriptions" fill="#0F2044" radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="commissions" name="Commissions" fill="#E85D24" stackId="a" />
            <Bar dataKey="ads" name="Advertising" fill="#1D9E75" radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Industry pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0F2044] mb-4">Shipments by Industry</h2>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={INDUSTRY_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {INDUSTRY_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {INDUSTRY_DATA.map((d) => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-[#0F2044] flex-1">{d.name}</span>
                  <span className="text-sm font-bold text-[#0F2044]">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0F2044] mb-4">Driver Activity</h2>
          <div className="space-y-3">
            {[
              { label: 'Active drivers today', value: '142', color: '#1D9E75' },
              { label: 'Border reports today', value: '89', color: '#E85D24' },
              { label: 'Most reported border', value: 'Beitbridge (47)', color: '#0F2044' },
              { label: 'Report accuracy rate', value: '94%', color: '#F2A623' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-[#6B7280]">{s.label}</span>
                <span className="text-sm font-black" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Companies ───────────────────────────────────────────────────────────────

const COMPANIES = [
  { id: 'comp-001', name: 'Ndlovu Transport Group', plan: 'Business', country: 'South Africa', trucks: 38, mrr: 1999, status: 'Active' },
  { id: 'comp-002', name: 'Copperbelt Hauliers', plan: 'Professional', country: 'Zambia', trucks: 22, mrr: 499, status: 'Active' },
  { id: 'comp-003', name: 'Safari Freight', plan: 'Starter', country: 'Zimbabwe', trucks: 5, mrr: 0, status: 'Trial' },
  { id: 'comp-004', name: 'Meridian Logistics', plan: 'Business', country: 'South Africa', trucks: 55, mrr: 1999, status: 'Active' },
  { id: 'comp-005', name: 'Trans-Africa Carriers', plan: 'Professional', country: 'Mozambique', trucks: 15, mrr: 499, status: 'Active' },
];

function AdminCompanies() {
  const planColors: Record<string, string> = { Business: '#0F2044', Professional: '#E85D24', Starter: '#6B7280', Enterprise: '#1D9E75' };

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Companies</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Company', 'Plan', 'Country', 'Trucks', 'MRR', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COMPANIES.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-[#0F2044] text-sm">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: planColors[c.plan], backgroundColor: `${planColors[c.plan]}15` }}>{c.plan}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280]">{c.country}</td>
                  <td className="px-5 py-3.5 text-sm text-[#0F2044] font-medium">{c.trucks}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{c.mrr > 0 ? formatZAR(c.mrr) : 'Free'}</td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-bold px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#F2A623]/10 text-[#F2A623]'}`}>{c.status}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <Link to="/dashboard" className="text-xs text-[#E85D24] font-semibold hover:underline">View</Link>
                      <button className="text-xs text-[#6B7280] font-semibold hover:underline">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

const DRIVERS = [
  { name: 'Peter Dube', phone: '+27 82 111 0001', idVerified: true, truckReg: 'GP 123-456', routes: ['JHB → Harare', 'JHB → Lusaka'], reports: 89, points: 1240, status: 'Active' },
  { name: 'Moses Banda', phone: '+260 97 111 0001', idVerified: true, truckReg: 'ZM 456-789', routes: ['JHB → Lusaka'], reports: 210, points: 2840, status: 'Active' },
  { name: 'Grace Ncube', phone: '+263 77 111 0002', idVerified: true, truckReg: 'ZW 789-123', routes: ['Durban → Maputo'], reports: 145, points: 1750, status: 'Active' },
  { name: 'John Moyo', phone: '+27 83 111 0003', idVerified: false, truckReg: 'GP 000-001', routes: ['Local only'], reports: 12, points: 180, status: 'Pending Verification' },
];

function AdminDrivers() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0F2044]">Driver Management</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Verify drivers, manage points, and moderate reports.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Drivers', value: '8,241' },
          { label: 'Verified Today', value: '12' },
          { label: 'Pending Verification', value: '34' },
          { label: 'Reports This Week', value: '623' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-1">{s.label}</div>
            <div className="text-xl font-black text-[#0F2044]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Driver', 'Phone', 'ID', 'Truck Reg', 'Reports', 'Points', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DRIVERS.map((d) => (
                <tr key={d.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-[#0F2044] text-sm">{d.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280]">{d.phone}</td>
                  <td className="px-5 py-3.5">{d.idVerified ? <span className="text-xs font-bold text-[#1D9E75]">✓ Verified</span> : <span className="text-xs font-bold text-[#E24B4A]">Pending</span>}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#6B7280]">{d.truckReg}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{d.reports}</td>
                  <td className="px-5 py-3.5 text-sm font-black text-[#F2A623]">{d.points.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.status === 'Active' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#F2A623]/10 text-[#F2A623]'}`}>{d.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {!d.idVerified && <button className="text-xs bg-[#1D9E75] text-white px-2 py-1 rounded font-semibold">Verify</button>}
                      <button className="text-xs text-[#E24B4A] font-semibold hover:underline">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Marketplace admin ────────────────────────────────────────────────────────

function AdminMarketplace() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Marketplace Management</h1>
      <p className="text-sm text-[#6B7280] mb-6">All active shipments, quotes, and bookings.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Local Shipments', value: '34', pct: '34%', color: '#1E40AF' },
          { label: 'Cross-Border Shipments', value: '65', pct: '66%', color: '#E85D24' },
          { label: 'Pending Quotes', value: '127', pct: '', color: '#F2A623' },
          { label: 'Commission This Month', value: 'R28,400', pct: '', color: '#1D9E75' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-[#6B7280] mb-1">{k.label}</div>
            <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
            {k.pct && <div className="text-xs text-[#6B7280] mt-0.5">{k.pct} of total</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0F2044] mb-4">Top Local Routes</h2>
          <div className="space-y-3">
            {[['JHB → Cape Town', '28%'], ['JHB → Durban', '22%'], ['Cape Town → JHB', '18%'], ['DBN → JHB', '14%']].map(([r, p]) => (
              <div key={r} className="flex items-center gap-3">
                <span className="text-sm text-[#0F2044] flex-1">{r}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2"><div className="bg-[#1E40AF] h-2 rounded-full" style={{ width: p }} /></div>
                <span className="text-xs font-bold text-[#6B7280] w-10 text-right">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0F2044] mb-4">Top Cross-Border Routes</h2>
          <div className="space-y-3">
            {[['JHB → Harare', '31%'], ['JHB → Lusaka', '24%'], ['DBN → Maputo', '18%'], ['JHB → Gaborone', '12%']].map(([r, p]) => (
              <div key={r} className="flex items-center gap-3">
                <span className="text-sm text-[#0F2044] flex-1">{r}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2"><div className="bg-[#E85D24] h-2 rounded-full" style={{ width: p }} /></div>
                <span className="text-xs font-bold text-[#6B7280] w-10 text-right">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

const DISPUTES = [
  { ref: 'BW-SHP-0189', parties: 'AgriSA vs Safari Freight', issue: 'Cargo damaged in transit', amount: 45000, status: 'Open', raised: '3 Jun 2026' },
  { ref: 'BW-SHP-0167', parties: 'RetailCo vs Trans-Africa', issue: 'Late delivery — 3 days', amount: 12200, status: 'Open', raised: '1 Jun 2026' },
  { ref: 'BW-SHP-0145', parties: 'MiningCo vs Ndlovu Transport', issue: 'Wrong cargo delivered', amount: 28000, status: 'Resolved', raised: '28 May 2026' },
];

function AdminDisputes() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-6">Dispute Center</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Reference', 'Parties', 'Issue', 'Amount', 'Raised', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DISPUTES.map((d) => (
                <tr key={d.ref} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-[#0F2044]">{d.ref}</td>
                  <td className="px-5 py-3.5 text-sm text-[#0F2044]">{d.parties}</td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280]">{d.issue}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[#0F2044]">{formatZAR(d.amount)}</td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280]">{d.raised}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.status === 'Open' ? 'bg-[#E24B4A]/10 text-[#E24B4A]' : 'bg-[#1D9E75]/10 text-[#1D9E75]'}`}>{d.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {d.status === 'Open' && (
                      <div className="flex gap-2">
                        <button className="text-xs bg-[#1D9E75] text-white px-2 py-1 rounded font-semibold">Carrier</button>
                        <button className="text-xs bg-[#0F2044] text-white px-2 py-1 rounded font-semibold">Shipper</button>
                        <button className="text-xs bg-[#F2A623] text-white px-2 py-1 rounded font-semibold">Refund</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Borders admin ────────────────────────────────────────────────────────────

const BORDERS_DATA = [
  { name: 'Beitbridge', status: 'SEVERE', wait: '8h 20min', reports: 47, accuracy: '96%', lastUpdated: '6 min ago' },
  { name: 'Kazungula', status: 'MODERATE', wait: '3h 10min', reports: 23, accuracy: '91%', lastUpdated: '12 min ago' },
  { name: 'Lebombo', status: 'FLOWING', wait: '45 min', reports: 18, accuracy: '94%', lastUpdated: '8 min ago' },
  { name: 'Chirundu', status: 'FLOWING', wait: '1h 10min', reports: 15, accuracy: '93%', lastUpdated: '5 min ago' },
  { name: 'Groblersbrug', status: 'MODERATE', wait: '2h 40min', reports: 11, accuracy: '89%', lastUpdated: '22 min ago' },
];

function AdminBorders() {
  const statusColor = (s: string) => s === 'SEVERE' ? '#E24B4A' : s === 'MODERATE' ? '#F2A623' : '#1D9E75';

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Border Intelligence Management</h1>
      <p className="text-sm text-[#6B7280] mb-6">Override driver reports, add official notices, view historical data.</p>
      <div className="space-y-3">
        {BORDERS_DATA.map((b) => (
          <div key={b.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#0F2044]">{b.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: statusColor(b.status), backgroundColor: `${statusColor(b.status)}15` }}>{b.status}</span>
                </div>
                <div className="text-sm text-[#6B7280]">Wait: <span className="font-bold text-[#0F2044]">{b.wait}</span> · {b.reports} reports today · {b.accuracy} accuracy · Updated {b.lastUpdated}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-[#F2A623] text-white px-3 py-1.5 rounded-lg font-semibold">Override Status</button>
                <button className="text-xs border border-gray-200 text-[#0F2044] px-3 py-1.5 rounded-lg font-semibold">Add Notice</button>
                <button className="text-xs border border-gray-200 text-[#6B7280] px-3 py-1.5 rounded-lg">History</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function AdminReports() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0F2044] mb-2">Government & Partnership Reports</h1>
      <p className="text-sm text-[#6B7280] mb-6">Export platform data for government authorities and partners.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: 'Border Delay Report', desc: 'Average wait times by border post and date. PDF/CSV.', icon: MapPin },
          { title: 'Freight Movement Report', desc: 'Volume by corridor, cargo types, industry breakdown.', icon: TrendingUp },
          { title: 'Driver Activity Report', desc: 'Verified driver counts, report volumes, accuracy rates.', icon: Users },
          { title: 'Platform Audit Log', desc: 'Complete user action log for compliance and auditing.', icon: FileText },
        ].map((r) => (
          <div key={r.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-[#E85D24]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <r.icon size={18} className="text-[#E85D24]" />
              </div>
              <div>
                <div className="font-bold text-[#0F2044]">{r.title}</div>
                <div className="text-sm text-[#6B7280] mt-0.5">{r.desc}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#0F2044] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#1a3060] transition-colors">Export PDF</button>
              <button className="flex-1 border border-gray-200 text-[#0F2044] text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">Export CSV</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Generic placeholder ──────────────────────────────────────────────────────

function AdminGeneric({ title }: { title: string }) {
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

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  let content: React.ReactNode;
  if (path === '/admin' || path === '/admin/') content = <AdminOverview />;
  else if (path === '/admin/companies') content = <AdminCompanies />;
  else if (path === '/admin/drivers') content = <AdminDrivers />;
  else if (path === '/admin/marketplace') content = <AdminMarketplace />;
  else if (path === '/admin/disputes') content = <AdminDisputes />;
  else if (path === '/admin/borders') content = <AdminBorders />;
  else if (path === '/admin/reports') content = <AdminReports />;
  else content = <AdminGeneric title={ADMIN_NAV.find((n) => n.path === path)?.label ?? 'Admin'} />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0F2044]">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-[#0F2044] text-sm">Admin Panel</span>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <motion.div key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {content}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
