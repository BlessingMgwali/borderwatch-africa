import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F2044] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] transition-colors';
  const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#0F2044]">Password</label>
                <a href="#" className="text-xs text-[#E85D24] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls + ' pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-[#E85D24]" />
              <label htmlFor="remember" className="text-sm text-[#6B7280]">Keep me signed in</label>
            </div>

            <Link
              to="/dashboard"
              className="block w-full text-center bg-[#0F2044] text-white font-semibold py-3 rounded-lg hover:bg-[#1a3060] transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Link>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[#6B7280]">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-[#0F2044] hover:bg-gray-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15.84 8.18c0-.59-.05-1.16-.15-1.7H8v3.22h4.4a3.77 3.77 0 01-1.63 2.47v2.05h2.64c1.54-1.42 2.43-3.52 2.43-6.04z" fill="#4285F4"/>
                <path d="M8 16c2.21 0 4.07-.73 5.42-1.98l-2.64-2.05C9.97 12.64 9.05 12.9 8 12.9c-2.14 0-3.95-1.44-4.6-3.38H.67v2.12A8 8 0 008 16z" fill="#34A853"/>
                <path d="M3.4 9.52A4.82 4.82 0 013.14 8c0-.53.1-1.04.26-1.52V4.36H.67A8 8 0 000 8c0 1.29.31 2.51.67 3.64l2.73-2.12z" fill="#FBBC05"/>
                <path d="M8 3.1c1.21 0 2.29.41 3.15 1.23l2.35-2.35C12.06.74 10.2 0 8 0A8 8 0 00.67 4.36L3.4 6.48C4.05 4.54 5.86 3.1 8 3.1z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-[#0F2044] hover:bg-gray-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#E85D24] font-semibold hover:underline">Start free trial</Link>
        </p>
      </motion.div>
    </div>
  );
}
