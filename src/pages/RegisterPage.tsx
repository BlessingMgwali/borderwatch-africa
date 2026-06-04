import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────

const PRICING_CONFIG = {
  starter: { monthly: 0, annual: 0, name: 'Starter', label: 'Free forever' },
  professional: { monthly: 499, annual: 399, name: 'Professional', label: 'Most Popular' },
  business: { monthly: 1999, annual: 1599, name: 'Business', label: 'For growing fleets' },
};

// Rough ZAR to local currency rates (hardcoded)
const CURRENCY_RATES: Record<string, { code: string; symbol: string; rate: number }> = {
  'South Africa': { code: 'ZAR', symbol: 'R', rate: 1 },
  'Zimbabwe': { code: 'USD', symbol: '$', rate: 0.054 },
  'Zambia': { code: 'ZMW', symbol: 'K', rate: 1.07 },
  'Mozambique': { code: 'MZN', symbol: 'MT', rate: 3.44 },
  'Botswana': { code: 'BWP', symbol: 'P', rate: 0.74 },
  'Namibia': { code: 'NAD', symbol: 'N$', rate: 1 },
  'Tanzania': { code: 'TZS', symbol: 'TSh', rate: 141 },
  'Kenya': { code: 'KES', symbol: 'KSh', rate: 7.1 },
  'Uganda': { code: 'UGX', symbol: 'USh', rate: 202 },
  'Rwanda': { code: 'RWF', symbol: 'RF', rate: 73 },
  'Malawi': { code: 'MWK', symbol: 'MK', rate: 93 },
};

const AFRICAN_COUNTRIES = [
  'South Africa', 'Zimbabwe', 'Zambia', 'Mozambique', 'Botswana', 'Namibia',
  'Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Malawi', 'Angola', 'DRC',
  'Lesotho', 'Eswatini', 'Madagascar', 'Ghana', 'Nigeria', 'Ethiopia',
];

const OTHER_COUNTRIES = ['United Kingdom', 'United States', 'Germany', 'France', 'Netherlands', 'China', 'India', 'Australia'];

const COMPANY_TYPES = [
  'Independent Owner-Operator',
  'Small Haulage Company (2–10 trucks)',
  'Medium Haulage Company (11–50 trucks)',
  'Large Transport Group (51+ trucks)',
  'Freight Broker / Forwarder',
  'Logistics Technology Company',
  'Government / Parastatal',
  'Other',
];

const VEHICLE_RANGES = ['1', '2–5', '6–10', '11–25', '26–50', '51–100', '100+'];

const REFERRAL_SOURCES = [
  'Google Search',
  'LinkedIn',
  'Industry conference',
  'Recommended by a colleague',
  'Social media',
  'News article',
  'Other',
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Step1Data { fullName: string; email: string; password: string; phone: string }
interface Step2Data { companyName: string; companyType: string; country: string; vehicles: string; referral: string }
type PlanKey = 'starter' | 'professional' | 'business';

// ─── Plan card for Step 3 ─────────────────────────────────────────────────────

function Step3PlanCard({
  planKey,
  selected,
  onSelect,
  country,
}: {
  planKey: PlanKey;
  selected: boolean;
  onSelect: () => void;
  country: string;
}) {
  const plan = PRICING_CONFIG[planKey];
  const curr = CURRENCY_RATES[country];
  const zarPrice = plan.monthly;
  const localEquiv = curr && zarPrice > 0 ? Math.round(zarPrice * curr.rate) : null;

  const features: Record<PlanKey, string[]> = {
    starter: ['1 vehicle', '5 borders', 'Basic alerts'],
    professional: ['5 vehicles', 'All 18 borders', 'AI routes', 'WhatsApp alerts'],
    business: ['25 vehicles', 'Full analytics', 'Priority support', 'Custom reports'],
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
        selected
          ? 'border-[#E85D24] bg-[#FFF4EE]'
          : 'border-gray-200 bg-white hover:border-[#0F2044]/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-[#0F2044]">{plan.name}</div>
          <div className="text-xs text-[#6B7280]">{plan.label}</div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-[#E85D24] bg-[#E85D24]' : 'border-gray-300'
        }`}>
          {selected && <Check size={11} className="text-white" />}
        </div>
      </div>
      <div className="text-2xl font-black text-[#0F2044] mb-1">
        {zarPrice === 0 ? 'Free' : `R${zarPrice}/mo`}
      </div>
      {localEquiv && zarPrice > 0 && (
        <p className="text-xs text-[#6B7280] mb-3">
          approx {curr.symbol}{localEquiv.toLocaleString()} {curr.code} for reference. You are billed in ZAR.
        </p>
      )}
      <ul className="space-y-1">
        {features[planKey].map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Check size={11} className="text-[#1D9E75]" /> {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({ fullName: '', email: '', password: '', phone: '+27' });
  const [step2, setStep2] = useState<Step2Data>({ companyName: '', companyType: '', country: 'South Africa', vehicles: '', referral: '' });
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('professional');

  const updateStep1 = (k: keyof Step1Data, v: string) => setStep1((p) => ({ ...p, [k]: v }));
  const updateStep2 = (k: keyof Step2Data, v: string) => setStep2((p) => ({ ...p, [k]: v }));

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F2044] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] transition-colors';
  const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

  if (done) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-[#1D9E75]" />
          </div>
          <h2 className="text-2xl font-black text-[#0F2044] mb-3">Welcome to BorderWatch Africa!</h2>
          <p className="text-[#6B7280] mb-6">Your 14-day free trial has started. Let's get your fleet moving smarter.</p>
          <div className="bg-[#F8F9FA] rounded-xl p-4 mb-6 text-sm text-left">
            <div className="text-xs font-bold text-[#E85D24] uppercase tracking-wider mb-2">Your account</div>
            <div className="space-y-1 text-[#6B7280]">
              <div><span className="text-[#0F2044] font-medium">Name:</span> {step1.fullName}</div>
              <div><span className="text-[#0F2044] font-medium">Email:</span> {step1.email}</div>
              <div><span className="text-[#0F2044] font-medium">Company:</span> {step2.companyName}</div>
              <div><span className="text-[#0F2044] font-medium">Plan:</span> {PRICING_CONFIG[selectedPlan].name}</div>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="block w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#F8F9FA]">
      <div className="max-w-lg mx-auto px-4 py-12">
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

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 justify-center mb-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s < step ? 'bg-[#1D9E75] text-white' : s === step ? 'bg-[#E85D24] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {s < step ? <Check size={13} /> : s}
                </div>
                {s < 3 && (
                  <div className={`h-0.5 w-16 rounded-full transition-colors ${s < step ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#6B7280]">
            Step {step} of 3 — {step === 1 ? 'Your details' : step === 2 ? 'Your company' : 'Choose your plan'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-black text-[#0F2044] mb-1">Create your account</h2>
                <p className="text-sm text-[#6B7280] mb-6">Start your 14-day free trial. No credit card required.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input
                      type="text"
                      placeholder="Themba Ndlovu"
                      value={step1.fullName}
                      onChange={(e) => updateStep1('fullName', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email address</label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={step1.email}
                      onChange={(e) => updateStep1('email', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={step1.password}
                        onChange={(e) => updateStep1('password', e.target.value)}
                        className={inputCls + ' pr-10'}
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
                  <div>
                    <label className={labelCls}>Phone number</label>
                    <input
                      type="tel"
                      placeholder="+27 82 000 0000"
                      value={step1.phone}
                      onChange={(e) => updateStep1('phone', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!step1.fullName || !step1.email || !step1.password}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue <ChevronRight size={16} />
                </button>
                <p className="text-center text-xs text-[#6B7280] mt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#E85D24] font-medium hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F2044] mb-4 transition-colors">
                  <ArrowLeft size={13} /> Back
                </button>
                <h2 className="text-xl font-black text-[#0F2044] mb-1">About your company</h2>
                <p className="text-sm text-[#6B7280] mb-6">Help us personalise your experience.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Company name</label>
                    <input
                      type="text"
                      placeholder="Ndlovu Transport Group"
                      value={step2.companyName}
                      onChange={(e) => updateStep2('companyName', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Company type</label>
                    <select value={step2.companyType} onChange={(e) => updateStep2('companyType', e.target.value)} className={inputCls + ' bg-white'}>
                      <option value="">Select type...</option>
                      {COMPANY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <select value={step2.country} onChange={(e) => updateStep2('country', e.target.value)} className={inputCls + ' bg-white'}>
                      <optgroup label="Africa">
                        {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Other">
                        {OTHER_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Number of vehicles</label>
                    <select value={step2.vehicles} onChange={(e) => updateStep2('vehicles', e.target.value)} className={inputCls + ' bg-white'}>
                      <option value="">Select range...</option>
                      {VEHICLE_RANGES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>How did you hear about us?</label>
                    <select value={step2.referral} onChange={(e) => updateStep2('referral', e.target.value)} className={inputCls + ' bg-white'}>
                      <option value="">Select...</option>
                      {REFERRAL_SOURCES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  disabled={!step2.companyName || !step2.companyType || !step2.country}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F2044] mb-4 transition-colors">
                  <ArrowLeft size={13} /> Back
                </button>
                <h2 className="text-xl font-black text-[#0F2044] mb-1">Choose your plan</h2>
                <p className="text-sm text-[#6B7280] mb-6">Start free, upgrade when you're ready. No credit card required for trial.</p>
                <div className="space-y-3">
                  {(['starter', 'professional', 'business'] as PlanKey[]).map((k) => (
                    <Step3PlanCard
                      key={k}
                      planKey={k}
                      selected={selectedPlan === k}
                      onSelect={() => setSelectedPlan(k)}
                      country={step2.country}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setDone(true)}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm"
                >
                  Start My Free Trial <ChevronRight size={16} />
                </button>
                <p className="text-center text-xs text-[#6B7280] mt-3">
                  By creating an account you agree to our{' '}
                  <a href="#" className="text-[#E85D24] hover:underline">Terms</a> and{' '}
                  <a href="#" className="text-[#E85D24] hover:underline">Privacy Policy</a>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
