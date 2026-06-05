import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, ArrowRight, Trophy, Star, Truck, MapPin, Clock, Gift } from 'lucide-react';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { step: 1, title: 'Register as a Driver', desc: 'Create your free driver account. Add your truck, routes, and ID for verification.' },
  { step: 2, title: 'Drive Your Routes', desc: 'When you approach a border, report the current condition — takes 30 seconds.' },
  { step: 3, title: 'Earn Points & Rewards', desc: 'Every verified report earns points. Top drivers earn free subscriptions and airtime.' },
  { step: 4, title: 'Find Return Loads', desc: 'Browse available loads on your return routes. Submit quotes and never drive empty.' },
];

const REWARDS = [
  { points: 500, icon: Trophy, reward: '1 month free Professional plan', value: 'R499 value', color: '#CD7F32' },
  { points: 1000, icon: Gift, reward: 'R50 airtime voucher', value: 'Any network', color: '#A0AEC0' },
  { points: 2000, icon: Star, reward: '3 months free Professional plan', value: 'R1,497 value', color: '#F2A623' },
];

const TESTIMONIALS = [
  { name: 'Moses Banda', route: 'JHB → Harare route', quote: 'I have submitted over 200 reports. The points bought me 6 months of the Professional plan — and I found 12 loads on my return trips.', level: 'Gold', points: '2,840' },
  { name: 'Grace Ncube', route: 'Durban → Maputo route', quote: 'I used to drive back empty. Now I check BorderWatch and find loads 80% of the time. It changed my income.', level: 'Gold', points: '1,750' },
];

export default function DriverInfoPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#0F2044] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#E85D24]/20 border border-[#E85D24]/40 rounded-full px-4 py-1.5 mb-8">
              <Truck size={14} className="text-[#E85D24]" />
              <span className="text-xs font-medium text-[#E85D24]">Free to join — no subscription needed</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Earn While You Drive 🚛
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-2xl mx-auto">
              Report border conditions, earn points and rewards, and find return loads on your routes. Join 8,000+ drivers already on BorderWatch Africa.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-[#E85D24] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#d14f1a] transition-colors text-base">
                Register as Driver <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:border-white/60 transition-colors">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#E85D24] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {[
              { number: '8,000+', label: 'Active drivers' },
              { number: '89,000+', label: 'Border reports filed' },
              { number: '94%', label: 'Report accuracy' },
              { number: 'R2.4M', label: 'Rewards earned' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black">{s.number}</div>
                <div className="text-white/80 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-black text-[#0F2044] mb-3 text-center">How It Works</h2>
            <p className="text-[#6B7280] text-center mb-12">Four simple steps to start earning</p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#E85D24] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-black text-lg">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-[#0F2044] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Points system */}
      <section className="bg-[#F8F9FA] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-black text-[#0F2044] mb-3 text-center">Points & Levels</h2>
            <p className="text-[#6B7280] text-center mb-12">Every report earns points. More points = better rewards.</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <h3 className="font-bold text-[#0F2044] mb-4">How to earn points</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { action: 'Submit a border report', points: '+10 pts', icon: MapPin },
                  { action: 'Report verified by 3+ drivers', points: '+20 pts', icon: CheckCircle },
                  { action: 'Include a photo', points: '+15 pts', icon: Star },
                  { action: 'First report of the day at a border', points: '+25 pts', icon: Trophy },
                  { action: '7-day reporting streak', points: '+50 pts', icon: Clock },
                ].map(({ action, points, icon: Icon }) => (
                  <div key={action} className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl">
                    <div className="w-8 h-8 bg-[#E85D24]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#E85D24]" />
                    </div>
                    <span className="flex-1 text-sm text-[#0F2044]">{action}</span>
                    <span className="text-sm font-black text-[#1D9E75]">{points}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <h3 className="font-bold text-[#0F2044] mb-4">Driver Levels</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { level: 'Bronze', range: '0–100 pts', color: '#CD7F32' },
                  { level: 'Silver', range: '101–500 pts', color: '#A0AEC0' },
                  { level: 'Green', range: '501–1,000 pts', color: '#1D9E75' },
                  { level: 'Gold', range: '1,001+ pts', color: '#F2A623' },
                ].map((l) => (
                  <div key={l.level} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${l.color}10`, border: `2px solid ${l.color}30` }}>
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="font-black" style={{ color: l.color }}>{l.level}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{l.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Rewards */}
          <FadeUp delay={0.3}>
            <h3 className="font-bold text-[#0F2044] mb-4 text-center text-xl">Rewards You Can Earn</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {REWARDS.map((r, i) => (
                <motion.div key={r.points} whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${r.color}20` }}>
                    <r.icon size={28} style={{ color: r.color }} />
                  </div>
                  <div className="text-2xl font-black mb-1" style={{ color: r.color }}>{r.points} pts</div>
                  <div className="font-bold text-[#0F2044] mb-1 text-sm">{r.reward}</div>
                  <div className="text-xs text-[#6B7280]">{r.value}</div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-black text-[#0F2044] mb-12 text-center">Drivers Love BorderWatch</h2>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-[#F8F9FA] rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={15} className="fill-[#E85D24] text-[#E85D24]" />)}
                  </div>
                  <p className="text-[#0F2044] text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F2044] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F2044] text-sm">{t.name}</div>
                      <div className="text-xs text-[#6B7280]">{t.route}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs font-black text-[#F2A623]">{t.level}</div>
                      <div className="text-xs text-[#6B7280]">{t.points} pts</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F2044] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-black text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-white/70 text-lg mb-8">Join 8,000+ drivers. Free registration — takes under 5 minutes.</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-[#E85D24] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#d14f1a] transition-colors text-base">
              Register as Driver — It's Free <ArrowRight size={18} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
