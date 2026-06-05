import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES: Record<string, string> = {
  superadmin: '/admin',
  owner: '/dashboard',
  transporter: '/dashboard',
  cargo_owner: '/shipper',
  driver: '/driver',
};

const DEMO_ACCOUNTS = [
  { email: 'admin@borderwatch.africa', password: 'Admin@2024', role: 'Super Admin', color: '#0F2044' },
  { email: 'company@test.com', password: 'Company@2024', role: 'Transporter', color: '#E85D24' },
  { email: 'shipper@test.com', password: 'Shipper@2024', role: 'Cargo Owner', color: '#1D9E75' },
  { email: 'driver@test.com', password: 'Driver@2024', role: 'Driver', color: '#F2A623' },
  { email: 'owner@borderwatch.africa', password: 'Owner@2024', role: 'Owner', color: '#7C3AED' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F2044] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] transition-colors';
  const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

  useEffect(() => {
    if (user) {
      navigate(ROLE_ROUTES[user.role] ?? '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError('Invalid email or password.');
  }

  async function quickLogin(acc: typeof DEMO_ACCOUNTS[0]) {
    setError('');
    setLoading(true);
    const { error: err } = await signIn(acc.email, acc.password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="pt-16 min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 bg-[#E85D24] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="9" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-[#0F2044] font-bold text-lg">BorderWatch<span className="text-[#E85D24]">Africa</span></span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-black text-[#0F2044] mb-1">Welcome back</h2>
          <p className="text-sm text-[#6B7280] mb-6">Sign in to your BorderWatch Africa account.</p>

          {error && <div className="bg-[#FEF2F2] border border-[#E24B4A]/20 rounded-lg px-4 py-3 mb-4 text-sm text-[#E24B4A] font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Email address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F2044] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls + ' pr-10'} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#0F2044] text-white font-semibold py-3 rounded-lg hover:bg-[#1a3060] transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Demo accounts — click to sign in</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email} onClick={() => quickLogin(acc)} disabled={loading}
                  className="text-left p-3 rounded-xl border-2 hover:shadow-sm transition-all disabled:opacity-50"
                  style={{ borderColor: `${acc.color}30`, backgroundColor: `${acc.color}08` }}>
                  <div className="text-xs font-bold mb-0.5" style={{ color: acc.color }}>{acc.role}</div>
                  <div className="text-xs text-[#6B7280] truncate">{acc.email}</div>
                  <div className="flex items-center gap-1 mt-1.5 text-xs font-medium" style={{ color: acc.color }}>
                    Sign in <ChevronRight size={11} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#E85D24] font-semibold hover:underline">Get started free</Link>
        </p>
      </motion.div>
    </div>
  );
}
