import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Globe, Zap, BarChart3, ArrowRight } from 'lucide-react';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay }}>
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: '2024', label: 'Founded' },
  { value: '18', label: 'Border Posts' },
  { value: '11', label: 'Countries' },
  { value: '42,000+', label: 'Movements Tracked' },
];

const TECH_CARDS = [
  {
    icon: Globe,
    title: 'Real-Time Data Network',
    desc: 'We combine ground-level sensor data, crowdsourced reports from drivers, and official border authority feeds to give you a complete picture of border conditions — updated every 15 minutes.',
  },
  {
    icon: Zap,
    title: 'Predictive AI Engine',
    desc: 'Our machine learning models are trained on 3+ years of historical border crossing data, weather patterns, and trade volumes to predict delays before they happen with 95% accuracy.',
  },
  {
    icon: BarChart3,
    title: 'Freight Intelligence Layer',
    desc: 'Beyond tracking, we analyze cargo flow patterns across SADC to surface load matching opportunities, route optimizations, and market intelligence that directly impact your bottom line.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Section 1 — Mission (full navy) */}
      <section className="bg-[#0F2044] py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-4">About BorderWatch Africa</p>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white mb-8 leading-tight">
              Built to Move<br />Africa Forward.
            </h1>
            <div className="max-w-3xl">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                BorderWatch Africa was born from a simple, frustrating truth: Southern Africa's transport operators were losing millions of rand every year sitting in border queues they could have avoided — if only they had the right information.
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                We built the intelligence infrastructure that the continent's logistics sector has always needed. Today, we monitor 18 major border posts across 11 countries, processing over 3.2 million freight events monthly to give operators the real-time visibility they need to compete in a fast-moving global trade environment.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — Stats bar */}
      <section className="bg-[#E85D24] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08}>
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-sm text-orange-200">{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — The Gap */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <FadeUp>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">The Challenge</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-6">The African Logistics Gap</h2>
              <p className="text-[#6B7280] text-base leading-relaxed mb-4">
                Southern Africa is one of the world's most complex logistics environments. The SADC region has 15 member states, hundreds of border crossing points, and a transport sector that employs over 2 million people.
              </p>
              <p className="text-[#6B7280] text-base leading-relaxed mb-4">
                Yet until BorderWatch Africa, operators navigated this complexity with spreadsheets, WhatsApp groups, and word of mouth. The cost? Billions of rand in avoidable delays, empty return trips, and missed freight opportunities every year.
              </p>
              <p className="text-[#6B7280] text-base leading-relaxed">
                We believe Africa's logistics future is digital. Our mission is to close the information gap that holds the continent's transport sector back — one border post at a time.
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="space-y-4">
                {[
                  { problem: 'Beitbridge averages 8+ hour delays', solution: 'Real-time alerts let operators reroute before they queue' },
                  { problem: '40%+ of trucks return empty', solution: 'AI load matching cuts deadhead to under 12%' },
                  { problem: 'Operators plan around yesterday\'s data', solution: 'Predictive AI forecasts conditions 24 hours ahead' },
                  { problem: 'Customs docs cause preventable delays', solution: 'Digital document checklists validated before departure' },
                  { problem: 'Fuel costs are unpredictable', solution: 'Route optimization reduces fuel spend by up to 18%' },
                ].map(({ problem, solution }) => (
                  <div key={problem} className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                    <div className="text-sm font-medium text-[#E24B4A] mb-1">{problem}</div>
                    <div className="text-sm text-[#0F2044]">{solution}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Section 4 — Technology */}
      <section className="bg-[#F8F9FA] py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3 text-center">Our Technology</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2044] mb-12 text-center">What Makes It Work</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {TECH_CARDS.map((card, i) => (
              <FadeUp key={card.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm h-full">
                  <div className="w-11 h-11 bg-[#FFF4EE] rounded-xl flex items-center justify-center mb-5">
                    <card.icon size={22} className="text-[#E85D24]" />
                  </div>
                  <h3 className="font-bold text-[#0F2044] mb-3 text-base">{card.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{card.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — CTA */}
      <section className="bg-[#E85D24] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Move Smarter?</h2>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
              Join 1,200+ transport operators already using BorderWatch Africa.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-[#E85D24] font-bold px-7 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
