import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ClipboardList, Truck, User, Star, CheckCircle, Camera, Trophy, ChevronRight, AlertCircle, DollarSign, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, BorderReport } from '../lib/supabase';
import { BORDERS, DELAY_CAUSES, DRIVER_ROUTES, POINTS_CONFIG, REWARDS } from '../config/data';

// ─── Data ─────────────────────────────────────────────────────────────────────

const BORDER_STATUS = [
  { name: 'Beitbridge', status: 'SEVERE', wait: '8h 20min', color: '#E24B4A', reports: 3 },
  { name: 'Kazungula', status: 'MODERATE', wait: '3h 10min', color: '#F2A623', reports: 5 },
  { name: 'Lebombo', status: 'FLOWING', wait: '45 min', color: '#1D9E75', reports: 2 },
  { name: 'Chirundu', status: 'FLOWING', wait: '1h 10min', color: '#1D9E75', reports: 4 },
  { name: 'Groblersbrug', status: 'MODERATE', wait: '2h 40min', color: '#F2A623', reports: 2 },
];

const RETURN_LOADS = [
  { from: 'Harare', to: 'JHB', count: 3, value: 'R8,400' },
  { from: 'Lusaka', to: 'JHB', count: 1, value: 'R12,200' },
];

const AVAILABLE_LOADS = [
  { route: 'JHB → Harare', cargo: 'General Cargo', weight: '32t', revenue: 'R18,400', date: 'Today 14:00', type: 'cross_border' },
  { route: 'JHB → Lusaka', cargo: 'Mining Equipment', weight: '28t', revenue: 'R22,100', date: 'Tomorrow 08:00', type: 'cross_border' },
  { route: 'JHB → Cape Town', cargo: 'Retail/FMCG', weight: '15t', revenue: 'R9,200', date: 'Friday 06:00', type: 'local' },
  { route: 'Durban → JHB', cargo: 'Construction Materials', weight: '20t', revenue: 'R6,800', date: 'Tomorrow 10:00', type: 'local' },
];

const REPORT_HISTORY = [
  { date: '5 Jun', border: 'Beitbridge', status: '8h delay', verified: true },
  { date: '4 Jun', border: 'Kazungula', status: '3h delay', verified: true },
  { date: '3 Jun', border: 'Beitbridge', status: '6h delay', verified: true },
  { date: '2 Jun', border: 'Chirundu', status: 'Flowing', verified: false },
  { date: '1 Jun', border: 'Lebombo', status: '1h delay', verified: true },
];

const LEADERBOARD = [
  { rank: 1, name: 'Moses Banda', points: 2840, level: 'Gold' },
  { rank: 2, name: 'Sipho Mokoena', points: 2310, level: 'Gold' },
  { rank: 3, name: 'Joseph Mwila', points: 1980, level: 'Gold' },
  { rank: 4, name: 'Grace Ncube', points: 1750, level: 'Gold' },
  { rank: 5, name: 'Peter Dube', points: 1240, level: 'Gold', isMe: true },
];

// ─── Tab navigation ───────────────────────────────────────────────────────────

type Tab = 'home' | 'report' | 'loads' | 'profile';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'report', icon: ClipboardList, label: 'Report' },
    { id: 'loads', icon: Truck, label: 'Loads' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active === id ? 'text-[#E85D24]' : 'text-[#6B7280]'}`}>
            <Icon size={22} strokeWidth={active === id ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ onReport, onViewLoads }: { onReport: () => void; onViewLoads: () => void }) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-[#0F2044]">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Your routes: JHB → Harare, JHB → Lusaka</p>
      </div>

      {/* Big CTA */}
      <button onClick={onReport}
        className="w-full bg-[#E85D24] text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:bg-[#d14f1a] transition-colors active:scale-[0.98]">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ClipboardList size={24} />
        </div>
        <div className="text-left">
          <div className="font-black text-lg leading-tight">REPORT BORDER CONDITION</div>
          <div className="text-white/80 text-sm mt-0.5">Help thousands of drivers — takes 30 seconds</div>
        </div>
      </button>

      {/* Border cards */}
      <div>
        <h2 className="text-sm font-bold text-[#0F2044] mb-3">Your Route Borders</h2>
        <div className="space-y-2">
          {BORDER_STATUS.slice(0, 3).map((b) => (
            <div key={b.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-[#0F2044]">{b.name}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: b.color, backgroundColor: `${b.color}15` }}>{b.status}</span>
                </div>
                <span className="text-lg font-black" style={{ color: b.color }}>{b.wait}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Last reported by {b.reports} drivers</span>
                <button onClick={onReport} className="text-xs text-[#E85D24] font-semibold">Report Update</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points card */}
      <div className="bg-[#0F2044] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-[#F2A623]" />
            <span className="font-bold">Your Points</span>
          </div>
          <span className="text-xs text-white/60">This week</span>
        </div>
        <div className="text-3xl font-black text-[#F2A623] mb-1">{user?.points?.toLocaleString() ?? 340}</div>
        <div className="text-sm text-white/70 mb-3">Rank: #5 this week · {user?.level ?? 'Gold'} level</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {REWARDS.slice(0, 3).map((r) => (
            <div key={r.points} className="bg-white/10 rounded-lg p-2 text-center">
              <div className="font-bold text-[#F2A623]">{r.points} pts</div>
              <div className="text-white/70 mt-0.5 leading-tight">{r.reward.split(' ').slice(0, 3).join(' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Return loads */}
      <div>
        <h2 className="text-sm font-bold text-[#0F2044] mb-3">Return Loads Available</h2>
        {RETURN_LOADS.map((l) => (
          <div key={l.from} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-[#0F2044]">{l.from} ← JHB</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{l.count} load{l.count > 1 ? 's' : ''} available — {l.value}</div>
            </div>
            <button onClick={onViewLoads} className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-3 py-1.5 rounded-lg">View Loads</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Report tab ───────────────────────────────────────────────────────────────

function ReportTab() {
  const { user } = useAuth();
  const [rStep, setRStep] = useState(1);
  const [border, setBorder] = useState('');
  const [waitBucket, setWaitBucket] = useState('');
  const [causes, setCauses] = useState<string[]>([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [offline] = useState(!navigator.onLine);

  const waitOptions = ['Under 1 hour', '1-3 hours', '3-6 hours', '6-12 hours', '12+ hours'];

  const waitMinutesFromBucket = (bucket: string): number => {
    if (bucket === 'Under 1 hour') return 45;
    if (bucket === '1-3 hours') return 120;
    if (bucket === '3-6 hours') return 270;
    if (bucket === '6-12 hours') return 540;
    return 780;
  };

  const toggleCause = (c: string) => setCauses((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');
    const { error } = await supabase.from('border_reports').insert({
      border_name: border,
      wait_minutes: waitMinutesFromBucket(waitBucket),
      causes,
      driver_id: user.id,
      photo_url: hasPhoto ? 'uploaded' : null,
      verified_count: 0,
      status: 'unverified',
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  };

  const reset = () => {
    setRStep(1); setBorder(''); setWaitBucket(''); setCauses([]); setHasPhoto(false); setSubmitted(false); setSubmitError('');
  };

  const points = POINTS_CONFIG.reportSubmitted + (hasPhoto ? POINTS_CONFIG.photoIncluded : 0);

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-[#1D9E75]" />
        </div>
        <h2 className="text-xl font-black text-[#0F2044] mb-2">Report Submitted! ✅</h2>
        <p className="text-[#6B7280] mb-3">You earned <span className="text-[#F2A623] font-black">+{points} points 🏆</span></p>
        <p className="text-sm text-[#6B7280] mb-6">You are helping 2,400+ drivers on this route</p>
        <button className="w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share to WhatsApp
        </button>
        <button onClick={reset} className="w-full border-2 border-[#0F2044] text-[#0F2044] font-semibold py-3 rounded-xl">
          Report Another Border
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-black text-[#0F2044] mb-1">Report Border Condition</h1>
      <p className="text-sm text-[#6B7280] mb-5">Your reports help thousands of drivers</p>

      {offline && (
        <div className="bg-[#F2A623]/10 border border-[#F2A623]/30 rounded-xl p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-[#F2A623] flex-shrink-0" />
          <p className="text-xs text-[#0F2044]">No connection — your report will be submitted automatically when you reconnect</p>
        </div>
      )}

      {/* Step 1 — Border */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#0F2044] mb-2">Which border?</h2>
        <select className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#0F2044] bg-white focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24]"
          value={border} onChange={(e) => setBorder(e.target.value)}>
          <option value="">Select border post...</option>
          {BORDERS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Step 2 — Wait time */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#0F2044] mb-2">Current queue time?</h2>
        <div className="grid grid-cols-2 gap-2">
          {waitOptions.map((w) => (
            <button key={w} onClick={() => setWaitBucket(w)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-colors ${waitBucket === w ? 'border-[#E85D24] bg-[#FFF4EE] text-[#E85D24]' : 'border-gray-200 bg-white text-[#6B7280]'}`}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — Causes */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#0F2044] mb-2">What is causing the delay?</h2>
        <div className="flex flex-wrap gap-2">
          {DELAY_CAUSES.map((c) => (
            <button key={c} onClick={() => toggleCause(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${causes.includes(c) ? 'border-[#0F2044] bg-[#0F2044] text-white' : 'border-gray-200 bg-white text-[#6B7280]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Step 4 — Photo */}
      <div className="mb-6">
        <button onClick={() => setHasPhoto(!hasPhoto)}
          className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 text-sm font-semibold transition-colors ${hasPhoto ? 'border-[#1D9E75] bg-[#F0FDF4] text-[#1D9E75]' : 'border-gray-200 bg-white text-[#6B7280]'}`}>
          <Camera size={18} />
          {hasPhoto ? 'Photo added ✓ (+15 points)' : 'Add Photo (optional) — +15 points'}
        </button>
      </div>

      {/* Submit */}
      {submitError && <div className="text-[#E24B4A] text-sm font-medium">{submitError}</div>}
      <button
        onClick={handleSubmit}
        disabled={!border || !waitBucket || submitting}
        className="w-full bg-[#E85D24] text-white font-black text-base py-4 rounded-2xl hover:bg-[#d14f1a] transition-colors disabled:opacity-40 shadow-lg">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          `Submit Report — earn +${points} points`
        )}
      </button>
    </div>
  );
}

// ─── Loads tab ────────────────────────────────────────────────────────────────

function LoadsTab() {
  const [filter, setFilter] = useState<'all' | 'local' | 'cross_border'>('all');

  const filtered = filter === 'all' ? AVAILABLE_LOADS : AVAILABLE_LOADS.filter((l) => l.type === filter);

  return (
    <div>
      <h1 className="text-xl font-black text-[#0F2044] mb-4">Available Loads</h1>
      <div className="flex gap-2 mb-4">
        {[['all', 'All'], ['local', 'Local'], ['cross_border', 'Cross-Border']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === val ? 'bg-[#0F2044] text-white' : 'bg-gray-100 text-[#6B7280]'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((load, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-black text-[#0F2044] text-base">{load.route}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{load.cargo} · {load.weight}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${load.type === 'local' ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#FFF4EE] text-[#E85D24]'}`}>
                {load.type === 'local' ? '🇿🇦 Local' : '🌍 Cross-Border'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-[#1D9E75]">{load.revenue}</span>
              <span className="text-xs text-[#6B7280]">{load.date}</span>
            </div>
            <button className="w-full mt-3 bg-[#E85D24] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#d14f1a] transition-colors">
              Submit Quote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, signOut } = useAuth();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [reportHistory, setReportHistory] = useState<BorderReport[]>([]);
  const [driverProfile, setDriverProfile] = useState<{ truck_registration: string; report_count: number; id_verified: boolean; truck_verified: boolean; rating: number | null } | null>(null);

  const levelColors = { Bronze: '#CD7F32', Silver: '#A0AEC0', Green: '#1D9E75', Gold: '#F2A623' };
  const level = (user?.level ?? 'Bronze') as keyof typeof levelColors;

  useEffect(() => {
    if (!user) return;
    supabase.from('border_reports')
      .select('*').eq('driver_id', user.id).order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setReportHistory((data ?? []) as BorderReport[]));

    supabase.from('driver_profiles')
      .select('truck_registration, report_count, id_verified, truck_verified, rating')
      .eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setDriverProfile(data as typeof driverProfile); });
  }, [user]);

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-[#0F2044] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[#E85D24] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xl">{user?.name?.charAt(0) ?? 'P'}</span>
          </div>
          <div className="flex-1">
            <div className="font-black text-lg">{user?.name ?? 'Driver'}</div>
            <div className="flex items-center gap-2 mt-1">
              {driverProfile?.id_verified && <><CheckCircle size={13} className="text-[#1D9E75]" /><span className="text-xs text-white/70">ID Verified</span></>}
              {driverProfile?.truck_verified && <><CheckCircle size={13} className="text-[#1D9E75]" /><span className="text-xs text-white/70">Truck Verified</span></>}
            </div>
            <div className="text-xs text-white/60 mt-1">{driverProfile?.truck_registration ?? ''}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-black" style={{ color: levelColors[level] }}>{(user?.points ?? 0).toLocaleString()}</div>
            <div className="text-xs text-white/60">Points</div>
          </div>
          <div>
            <div className="text-xl font-black" style={{ color: levelColors[level] }}>{level}</div>
            <div className="text-xs text-white/60">Level</div>
          </div>
          <div>
            <div className="text-xl font-black text-white">{driverProfile?.report_count ?? 0}</div>
            <div className="text-xs text-white/60">Reports</div>
          </div>
        </div>
      </div>

      {/* Rating */}
      {driverProfile?.rating && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-[#0F2044]">Driver Rating</div>
            <div className="text-xs text-[#6B7280] mt-0.5">From cargo owners</div>
          </div>
          <div className="flex items-center gap-1">
            <Star size={18} className="fill-[#F2A623] text-[#F2A623]" />
            <span className="font-black text-[#0F2044] text-lg">{driverProfile.rating}</span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#F2A623]" />
            <span className="font-bold text-[#0F2044]">Leaderboard</span>
          </div>
          <ChevronRight size={16} className={`text-[#6B7280] transition-transform ${showLeaderboard ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-2">
                {LEADERBOARD.map((driver) => (
                  <div key={driver.rank} className={`flex items-center gap-3 p-2.5 rounded-lg ${driver.name === user?.name ? 'bg-[#FFF4EE] border border-[#E85D24]/30' : ''}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${driver.rank <= 3 ? 'bg-[#F2A623] text-white' : 'bg-gray-100 text-[#6B7280]'}`}>{driver.rank}</span>
                    <span className="flex-1 text-sm font-medium text-[#0F2044]">{driver.name} {driver.name === user?.name && '(You)'}</span>
                    <span className="text-sm font-black text-[#F2A623]">{driver.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Report history — real data */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0F2044]">Report History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {reportHistory.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#6B7280]">No reports yet. Submit your first border report.</div>
          ) : reportHistory.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-[#6B7280] w-20 flex-shrink-0">{new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
              <span className="text-sm font-medium text-[#0F2044] flex-1 truncate">{r.border_name}</span>
              <span className="text-xs text-[#6B7280]">{r.wait_minutes < 60 ? `${r.wait_minutes}m` : `${Math.round(r.wait_minutes / 60)}h`}</span>
              {r.status !== 'unverified' ? <CheckCircle size={14} className="text-[#1D9E75] flex-shrink-0" /> : <span className="text-xs text-[#6B7280]">—</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Settings / Sign out */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {[
          { label: 'Notification preferences', icon: Shield },
          { label: 'WhatsApp alerts', icon: MapPin },
          { label: 'Update routes', icon: Truck },
        ].map(({ label, icon: Icon }) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
            <Icon size={16} className="text-[#6B7280]" />
            <span className="flex-1 text-sm text-[#0F2044]">{label}</span>
            <ChevronRight size={14} className="text-[#6B7280]" />
          </button>
        ))}
        <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-[#E24B4A]">
          <DollarSign size={16} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-[#0F2044] px-4 pt-safe pt-4 pb-4 flex items-center gap-3">
        <div className="w-7 h-7 bg-[#E85D24] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="9" cy="9" r="2" fill="white"/>
          </svg>
        </div>
        <span className="text-white font-bold text-sm flex-1">BorderWatch Driver</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1D9E75]"></span>
          </span>
          <span className="text-white/70 text-xs">Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 pb-24 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
            {tab === 'home' && <HomeTab onReport={() => setTab('report')} onViewLoads={() => setTab('loads')} />}
            {tab === 'report' && <ReportTab />}
            {tab === 'loads' && <LoadsTab />}
            {tab === 'profile' && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
