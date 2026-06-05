import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, ChevronRight, ArrowLeft, CheckCircle, Truck, Package, Car, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDUSTRIES, DRIVER_ROUTES, CARGO_TYPES, TRUCK_TYPES, AFRICAN_COUNTRIES, SA_PROVINCES } from '../config/data';

type UserType = 'transporter' | 'cargo_owner' | 'driver' | 'subscriber';
type PlanKey = 'starter' | 'professional' | 'business';

const PRICING = {
  starter: { monthly: 0, commission: '10%', label: 'Free forever' },
  professional: { monthly: 499, commission: '8%', label: 'Most popular' },
  business: { monthly: 1999, commission: '6%', label: 'For growing fleets' },
};

const VEHICLE_SIZES = ['1', '2-5', '6-10', '11-25', '26-50', '50+'];
const FLEET_TYPES = ['Interlinks', 'Flatbeds', 'Reefers', 'Tankers', 'Mixed'];
const MONTHLY_VOLUMES = ['1-5 shipments', '6-20 shipments', '21-50 shipments', '50+'];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F2044] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85D24]/30 focus:border-[#E85D24] transition-colors bg-white';
const labelCls = 'block text-sm font-medium text-[#0F2044] mb-1.5';

// ─── Role selector ────────────────────────────────────────────────────────────

function RoleCard({ icon: Icon, title, sub, color, border, onClick }: {
  icon: typeof Truck; title: string; sub: string; color: string; border: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left rounded-2xl border-2 p-6 bg-white hover:shadow-lg transition-all"
      style={{ borderColor: border }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="font-black text-[#0F2044] text-lg mb-2">{title}</div>
      <p className="text-sm text-[#6B7280] leading-relaxed">{sub}</p>
      <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color }}>
        Get Started <ChevronRight size={14} />
      </div>
    </motion.button>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ planKey, selected, onSelect }: { planKey: PlanKey; selected: boolean; onSelect: () => void }) {
  const plan = PRICING[planKey];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-5 transition-all ${selected ? 'border-[#E85D24] bg-[#FFF4EE]' : 'border-gray-200 bg-white hover:border-[#0F2044]/30'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-[#0F2044] capitalize">{planKey}</div>
          <div className="text-xs text-[#6B7280]">{plan.label}</div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#E85D24] bg-[#E85D24]' : 'border-gray-300'}`}>
          {selected && <Check size={11} className="text-white" />}
        </div>
      </div>
      <div className="text-2xl font-black text-[#0F2044] mb-1">
        {plan.monthly === 0 ? 'Free' : `R${plan.monthly}/mo`}
      </div>
      <div className="text-sm text-[#E85D24] font-semibold">{plan.commission} commission on bookings</div>
    </button>
  );
}

// ─── Step progress ─────────────────────────────────────────────────────────────

function StepBar({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 justify-center mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i + 1 < step ? 'bg-[#1D9E75] text-white' : i + 1 === step ? 'bg-[#E85D24] text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i + 1 < step ? <Check size={13} /> : i + 1}
            </div>
            {i < total - 1 && <div className={`h-0.5 w-12 rounded-full transition-colors ${i + 1 < step ? 'bg-[#1D9E75]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-[#6B7280]">Step {step} of {total} — {label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userType, setUserType] = useState<UserType | null>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Shared account fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+27');

  // Driver-specific
  const [truckReg, setTruckReg] = useState('');
  const [truckType, setTruckType] = useState('');
  const [employer, setEmployer] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [driverConsents, setDriverConsents] = useState({ terms: false, popia: false, accurate: false });

  // Transporter-specific
  const [companyName, setCompanyName] = useState('');
  const [companyReg, setCompanyReg] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [fleetSize, setFleetSize] = useState('');
  const [fleetTypes, setFleetTypes] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('professional');

  // Cargo owner-specific
  const [industry, setIndustry] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [cargoRoutes, setCargoRoutes] = useState<string[]>([]);
  const [cargoTypes, setCargoTypes] = useState<string[]>([]);

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleFinish = () => {
    setDone(true);
    // Auto-login with demo accounts if matching
    if (userType === 'driver') login('driver@test.com', 'driver123');
    else if (userType === 'cargo_owner') login('shipper@test.com', 'shipper123');
    else if (userType === 'transporter') login('company@test.com', 'company123');
  };

  if (!userType) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
              <div className="w-8 h-8 bg-[#E85D24] rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="9" cy="9" r="2" fill="white"/>
                </svg>
              </div>
              <span className="text-[#0F2044] font-bold text-lg">BorderWatch<span className="text-[#E85D24]">Africa</span></span>
            </Link>
            <h1 className="text-3xl font-black text-[#0F2044] mb-2">Welcome to BorderWatch Africa</h1>
            <p className="text-[#6B7280]">Tell us how you will be using the platform</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <RoleCard icon={Truck} title="I Move Freight" color="#0F2044" border="#0F2044"
              sub="Transport companies, fleet owners, owner-operators and freight brokers"
              onClick={() => { setUserType('transporter'); setStep(1); }} />
            <RoleCard icon={Package} title="I Need Freight Moved" color="#E85D24" border="#E85D24"
              sub="Mining, agriculture, retail, construction, manufacturing and any business that ships goods"
              onClick={() => { setUserType('cargo_owner'); setStep(1); }} />
            <RoleCard icon={Car} title="I Am A Driver" color="#1D9E75" border="#1D9E75"
              sub="Report border conditions, update wait times, find return loads on your routes"
              onClick={() => { setUserType('driver'); setStep(1); }} />
            <RoleCard icon={CreditCard} title="I Have A Subscription" color="#6B7280" border="#6B7280"
              sub="I already pay for a BorderWatch plan and want to access my full platform"
              onClick={() => navigate('/login')} />
          </div>
          <p className="text-center text-xs text-[#6B7280] mt-8">
            By registering you agree to our <a href="#" className="text-[#E85D24] hover:underline">Terms</a> and <a href="#" className="text-[#E85D24] hover:underline">Privacy Policy (POPIA)</a>
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-[#1D9E75]" />
          </div>
          <h2 className="text-2xl font-black text-[#0F2044] mb-3">
            {userType === 'driver' ? 'Driver account created!' : 'Welcome to BorderWatch Africa!'}
          </h2>
          <p className="text-[#6B7280] mb-6">
            {userType === 'driver'
              ? 'Your ID and truck registration will be verified within 24 hours. You can start reporting immediately.'
              : userType === 'cargo_owner'
              ? 'Free to post shipments. BorderWatch charges 10% on confirmed bookings only.'
              : 'Your 14-day free trial has started. Let\'s get your fleet moving smarter.'}
          </p>
          <button
            onClick={() => {
              if (userType === 'driver') navigate('/driver');
              else if (userType === 'cargo_owner') navigate('/shipper');
              else navigate('/dashboard');
            }}
            className="block w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm"
          >
            {userType === 'driver' ? 'Go to Driver App' : userType === 'cargo_owner' ? 'Go to My Dashboard' : 'Go to Dashboard'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Driver flow ───────────────────────────────────────────────────────────

  if (userType === 'driver') {
    const stepLabels = ['Personal details', 'Vehicle details', 'Your routes', 'Consent'];
    return (
      <div className="pt-16 min-h-screen bg-[#F8F9FA]">
        <div className="max-w-lg mx-auto px-4 py-10">
          <button onClick={() => setUserType(null)} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F2044] mb-6">
            <ArrowLeft size={13} /> Back to role selection
          </button>
          <div className="text-center mb-6">
            <span className="text-3xl">🚗</span>
            <h1 className="text-xl font-black text-[#0F2044] mt-2">Driver Registration</h1>
          </div>
          <StepBar step={step} total={4} label={stepLabels[step - 1]} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="d1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Personal Details</h2>
                  <div className="space-y-4">
                    <div><label className={labelCls}>Full name</label>
                      <input className={inputCls} placeholder="Peter Dube" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div><label className={labelCls}>Phone number</label>
                      <input className={inputCls} placeholder="+27 82 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                    <div><label className={labelCls}>SA ID or passport number</label>
                      <input className={inputCls} placeholder="8001015009087" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} /></div>
                  </div>
                  <button onClick={() => setStep(2)} disabled={!name || !phone}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">
                    Continue
                  </button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="d2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Vehicle Details</h2>
                  <div className="space-y-4">
                    <div><label className={labelCls}>Truck registration number</label>
                      <input className={inputCls} placeholder="GP 123-456" value={truckReg} onChange={(e) => setTruckReg(e.target.value)} /></div>
                    <div><label className={labelCls}>Truck type</label>
                      <select className={inputCls} value={truckType} onChange={(e) => setTruckType(e.target.value)}>
                        <option value="">Select type...</option>
                        {TRUCK_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Employer / Company (optional)</label>
                      <input className={inputCls} placeholder='Leave blank if "Independent"' value={employer} onChange={(e) => setEmployer(e.target.value)} /></div>
                  </div>
                  <button onClick={() => setStep(3)} disabled={!truckReg || !truckType}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">
                    Continue
                  </button>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="d3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Your Routes</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Select the routes you regularly drive</p>
                  <div className="space-y-2">
                    {DRIVER_ROUTES.map((route) => (
                      <label key={route} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={selectedRoutes.includes(route)}
                          onChange={() => toggleArr(selectedRoutes, setSelectedRoutes, route)}
                          className="w-4 h-4 rounded border-gray-300 text-[#E85D24]" />
                        <span className="text-sm text-[#0F2044]">{route}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => setStep(4)} disabled={selectedRoutes.length === 0}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">
                    Continue
                  </button>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="d4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Confirm & Create Account</h2>
                  <div className="bg-[#FFF4EE] border border-[#E85D24]/20 rounded-lg p-4 mb-4 text-sm text-[#0F2044]">
                    Your ID and truck registration will be verified within 24 hours. You can start reporting immediately.
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'terms', label: 'I agree to the Terms of Service' },
                      { key: 'popia', label: 'I consent to POPIA data processing' },
                      { key: 'accurate', label: 'I confirm my details are accurate' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox"
                          checked={driverConsents[key as keyof typeof driverConsents]}
                          onChange={(e) => setDriverConsents((p) => ({ ...p, [key]: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-[#E85D24] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#0F2044]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleFinish}
                    disabled={!Object.values(driverConsents).every(Boolean)}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3.5 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">
                    Create Driver Account
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ── Transporter flow ──────────────────────────────────────────────────────

  if (userType === 'transporter') {
    const stepLabels = ['Account details', 'Company info', 'Choose plan', 'Consent'];
    return (
      <div className="pt-16 min-h-screen bg-[#F8F9FA]">
        <div className="max-w-lg mx-auto px-4 py-10">
          <button onClick={() => setUserType(null)} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F2044] mb-6">
            <ArrowLeft size={13} /> Back to role selection
          </button>
          <div className="text-center mb-6">
            <span className="text-3xl">🚛</span>
            <h1 className="text-xl font-black text-[#0F2044] mt-2">Transporter Registration</h1>
          </div>
          <StepBar step={step} total={4} label={stepLabels[step - 1]} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="t1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Create Your Account</h2>
                  <div className="space-y-4">
                    <div><label className={labelCls}>Full name</label><input className={inputCls} placeholder="Themba Ndlovu" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div><label className={labelCls}>Email</label><input type="email" className={inputCls} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                    <div><label className={labelCls}>Password</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} className={inputCls + ' pr-10'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div><label className={labelCls}>Phone</label><input className={inputCls} placeholder="+27 82 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  </div>
                  <button onClick={() => setStep(2)} disabled={!name || !email || !password}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">Continue</button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="t2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Company Details</h2>
                  <div className="space-y-4">
                    <div><label className={labelCls}>Company name</label><input className={inputCls} placeholder="Ndlovu Transport Group" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
                    <div><label className={labelCls}>Registration number (optional)</label><input className={inputCls} placeholder="2020/123456/07" value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} /></div>
                    <div><label className={labelCls}>Country</label>
                      <select className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                        {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Number of trucks</label>
                      <select className={inputCls} value={fleetSize} onChange={(e) => setFleetSize(e.target.value)}>
                        <option value="">Select...</option>
                        {VEHICLE_SIZES.map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Fleet type (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {FLEET_TYPES.map((ft) => (
                          <button key={ft} type="button"
                            onClick={() => toggleArr(fleetTypes, setFleetTypes, ft)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${fleetTypes.includes(ft) ? 'bg-[#0F2044] text-white border-[#0F2044]' : 'bg-white text-[#6B7280] border-gray-200 hover:border-[#0F2044]'}`}>
                            {ft}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setStep(3)} disabled={!companyName || !country || !fleetSize}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">Continue</button>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="t3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-1">Choose Your Plan</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Start free. Commission rate drops with your subscription.</p>
                  <div className="space-y-3">
                    {(['starter', 'professional', 'business'] as PlanKey[]).map((k) => (
                      <PlanCard key={k} planKey={k} selected={selectedPlan === k} onSelect={() => setSelectedPlan(k)} />
                    ))}
                  </div>
                  <button onClick={() => setStep(4)}
                    className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">Continue</button>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="t4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                  <h2 className="text-lg font-black text-[#0F2044] mb-4">Almost there!</h2>
                  <div className="bg-[#F8F9FA] rounded-xl p-4 mb-6 text-sm space-y-1">
                    <div><span className="text-[#6B7280]">Name:</span> <span className="font-medium text-[#0F2044]">{name}</span></div>
                    <div><span className="text-[#6B7280]">Company:</span> <span className="font-medium text-[#0F2044]">{companyName}</span></div>
                    <div><span className="text-[#6B7280]">Plan:</span> <span className="font-medium text-[#0F2044] capitalize">{selectedPlan} — {PRICING[selectedPlan].commission} commission</span></div>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-6">
                    By creating an account you agree to our <a href="#" className="text-[#E85D24]">Terms</a> and <a href="#" className="text-[#E85D24]">Privacy Policy</a>.
                    Platform commission of {PRICING[selectedPlan].commission} applies to all confirmed marketplace bookings.
                  </p>
                  <button onClick={handleFinish}
                    className="w-full bg-[#E85D24] text-white font-semibold py-3.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">
                    Create Account & Start Free Trial
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ── Cargo owner flow ──────────────────────────────────────────────────────

  const stepLabels = ['Account details', 'Company & industry', 'Shipment preferences', 'Consent'];
  return (
    <div className="pt-16 min-h-screen bg-[#F8F9FA]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button onClick={() => setUserType(null)} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F2044] mb-6">
          <ArrowLeft size={13} /> Back to role selection
        </button>
        <div className="text-center mb-6">
          <span className="text-3xl">📦</span>
          <h1 className="text-xl font-black text-[#0F2044] mt-2">Cargo Owner Registration</h1>
        </div>
        <StepBar step={step} total={4} label={stepLabels[step - 1]} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="c1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-black text-[#0F2044] mb-4">Create Your Account</h2>
                <div className="space-y-4">
                  <div><label className={labelCls}>Full name</label><input className={inputCls} placeholder="Sipho Dlamini" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div><label className={labelCls}>Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} className={inputCls + ' pr-10'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} placeholder="+27 82 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
                <button onClick={() => setStep(2)} disabled={!name || !email || !password}
                  className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">Continue</button>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="c2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                <h2 className="text-lg font-black text-[#0F2044] mb-4">Company & Industry</h2>
                <div className="space-y-4">
                  <div><label className={labelCls}>Company name</label><input className={inputCls} placeholder="Copperbelt Mining Supplies" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
                  <div><label className={labelCls}>Industry</label>
                    <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Country</label>
                    <select className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                      {AFRICAN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Typical monthly shipment volume</label>
                    <select className={inputCls} value={monthlyVolume} onChange={(e) => setMonthlyVolume(e.target.value)}>
                      <option value="">Select...</option>
                      {MONTHLY_VOLUMES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep(3)} disabled={!companyName || !industry || !country}
                  className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors disabled:opacity-40 text-sm">Continue</button>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="c3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                <h2 className="text-lg font-black text-[#0F2044] mb-4">Shipment Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Typical routes (select all)</label>
                    <div className="space-y-2">
                      {DRIVER_ROUTES.map((r) => (
                        <label key={r} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={cargoRoutes.includes(r)}
                            onChange={() => toggleArr(cargoRoutes, setCargoRoutes, r)}
                            className="w-4 h-4 rounded border-gray-300 text-[#E85D24]" />
                          <span className="text-sm text-[#0F2044]">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Typical cargo types (select all)</label>
                    <div className="flex flex-wrap gap-2">
                      {CARGO_TYPES.map((ct) => (
                        <button key={ct} type="button"
                          onClick={() => toggleArr(cargoTypes, setCargoTypes, ct)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${cargoTypes.includes(ct) ? 'bg-[#0F2044] text-white border-[#0F2044]' : 'bg-white text-[#6B7280] border-gray-200 hover:border-[#0F2044]'}`}>
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(4)}
                  className="mt-6 w-full bg-[#E85D24] text-white font-semibold py-3 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">Continue</button>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="c4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#6B7280] mb-4"><ArrowLeft size={13} /> Back</button>
                <h2 className="text-lg font-black text-[#0F2044] mb-4">Almost there!</h2>
                <div className="bg-[#F0FDF4] border border-[#1D9E75]/20 rounded-lg p-4 mb-6 text-sm text-[#0F2044]">
                  <span className="text-[#1D9E75] font-bold">Free to post shipments.</span> BorderWatch charges 10% on confirmed bookings only.
                </div>
                <div className="bg-[#F8F9FA] rounded-xl p-4 mb-4 text-sm space-y-1">
                  <div><span className="text-[#6B7280]">Name:</span> <span className="font-medium text-[#0F2044]">{name}</span></div>
                  <div><span className="text-[#6B7280]">Company:</span> <span className="font-medium text-[#0F2044]">{companyName}</span></div>
                  <div><span className="text-[#6B7280]">Industry:</span> <span className="font-medium text-[#0F2044]">{industry}</span></div>
                </div>
                <p className="text-xs text-[#6B7280] mb-6">
                  By creating an account you agree to our <a href="#" className="text-[#E85D24]">Terms</a> and <a href="#" className="text-[#E85D24]">Privacy Policy</a>.
                </p>
                <button onClick={handleFinish}
                  className="w-full bg-[#E85D24] text-white font-semibold py-3.5 rounded-lg hover:bg-[#d14f1a] transition-colors text-sm">
                  Create Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
