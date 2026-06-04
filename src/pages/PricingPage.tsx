import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Check, Star } from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────

const PRICING = {
  starter: { monthly: 0, annual: 0 },
  professional: { monthly: 499, annual: 399 },
  business: { monthly: 1999, annual: 1599 },
};

type BillingCycle = 'monthly' | 'annual';

function fmt(n: number) {
  if (n === 0) return 'Free';
  return `R${n.toLocaleString()}`;
}

// ─── Features ────────────────────────────────────────────────────────────────

const PLAN_FEATURES = {
  starter: [
    '1 vehicle tracked',
    '5 border posts monitored',
    'Basic delay alerts (email)',
    'Marketplace view-only',
    'Community support',
    '7-day data history',
  ],
  professional: [
    '5 vehicles tracked',
    'All 18 border posts',
    'WhatsApp & email alerts',
    'AI route intelligence',
    'Freight marketplace access',
    '90-day data history',
    'ETA predictions',
    'Priority email support',
  ],
  business: [
    '25 vehicles tracked',
    'All 18 border posts',
    'Full analytics dashboard',
    'Custom reports & exports',
    'API access (1,000 req/day)',
    '365-day data history',
    'Geofencing & zone alerts',
    'Priority phone support',
    'Onboarding specialist',
  ],
  enterprise: [
    'Unlimited vehicles',
    'All 18 border posts',
    'Dedicated account manager',
    'Custom API integration',
    'White-label options',
    'Custom SLA agreement',
    'Unlimited data history',
    'Security audit & compliance',
    '24/7 emergency support',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaVariant: 'navy-outline' | 'orange' | 'navy' | 'orange-outline';
  badge?: string;
  highlight?: boolean;
}

function PlanCard({ name, price, period, description, features, cta, ctaVariant, badge, highlight }: PlanCardProps) {
  const ctaClass = {
    'navy-outline': 'border-2 border-[#0F2044] text-[#0F2044] hover:bg-[#0F2044] hover:text-white',
    'orange': 'bg-[#E85D24] text-white hover:bg-[#d14f1a]',
    'navy': 'bg-[#0F2044] text-white hover:bg-[#1a3060]',
    'orange-outline': 'border-2 border-[#E85D24] text-[#E85D24] hover:bg-[#E85D24] hover:text-white',
  }[ctaVariant];

  return (
    <div className={`rounded-2xl flex flex-col h-full ${
      highlight
        ? 'bg-[#0F2044] text-white ring-2 ring-[#E85D24] shadow-xl scale-[1.02]'
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="p-6 pb-4 relative">
        {badge && (
          <span className="absolute top-4 right-4 bg-[#E85D24] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${highlight ? 'text-[#E85D24]' : 'text-[#E85D24]'}`}>{name}</p>
        <div className="flex items-end gap-1 mb-1">
          <span className={`text-4xl font-black ${highlight ? 'text-white' : 'text-[#0F2044]'}`}>{price}</span>
          {period && <span className={`text-sm mb-1.5 ${highlight ? 'text-gray-400' : 'text-[#6B7280]'}`}>/{period}</span>}
        </div>
        <p className={`text-sm ${highlight ? 'text-gray-400' : 'text-[#6B7280]'}`}>{description}</p>
      </div>

      <div className="px-6 pb-6 flex-1 flex flex-col">
        <div className={`border-t ${highlight ? 'border-white/10' : 'border-gray-100'} pt-5 mb-6 flex-1`}>
          <ul className="space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check size={14} className={`mt-0.5 flex-shrink-0 ${highlight ? 'text-[#1D9E75]' : 'text-[#1D9E75]'}`} />
                <span className={`text-sm ${highlight ? 'text-gray-300' : 'text-[#6B7280]'}`}>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/register"
          className={`block text-center text-sm font-semibold py-3 rounded-lg transition-colors ${ctaClass}`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#F8F9FA] border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest text-[#E85D24] mb-3">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0F2044] mb-4">Simple, Transparent Pricing</h1>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto mb-8">
              Start free. Scale as you grow. Cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              {(['monthly', 'annual'] as BillingCycle[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                    billing === b ? 'bg-[#0F2044] text-white' : 'text-[#6B7280] hover:text-[#0F2044]'
                  }`}
                >
                  {b === 'annual' ? 'Annual (Save 20%)' : 'Monthly'}
                </button>
              ))}
            </div>

            <p className="text-xs text-[#6B7280] mt-3">All prices in ZAR. Approximate local equivalents shown for reference.</p>
          </FadeUp>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
              <PlanCard
                name="Starter"
                price={fmt(PRICING.starter[billing])}
                period=""
                description="Free forever. Perfect to get started."
                features={PLAN_FEATURES.starter}
                cta="Get Started Free"
                ctaVariant="navy-outline"
              />
              <PlanCard
                name="Professional"
                price={billing === 'monthly' ? `R${PRICING.professional.monthly}` : `R${PRICING.professional.annual}`}
                period="mo"
                description={billing === 'annual' ? `Billed annually (R${PRICING.professional.annual * 12}/yr)` : 'Billed monthly'}
                features={PLAN_FEATURES.professional}
                cta="Start 14-Day Free Trial"
                ctaVariant="orange"
                badge="MOST POPULAR"
                highlight
              />
              <PlanCard
                name="Business"
                price={billing === 'monthly' ? `R${PRICING.business.monthly.toLocaleString()}` : `R${PRICING.business.annual.toLocaleString()}`}
                period="mo"
                description={billing === 'annual' ? `Billed annually (R${(PRICING.business.annual * 12).toLocaleString()}/yr)` : 'Billed monthly'}
                features={PLAN_FEATURES.business}
                cta="Start 14-Day Free Trial"
                ctaVariant="navy"
              />
              <PlanCard
                name="Enterprise"
                price="Custom"
                period=""
                description="For large fleets and enterprise logistics groups."
                features={PLAN_FEATURES.enterprise}
                cta="Request Enterprise Demo"
                ctaVariant="orange-outline"
              />
            </div>
          </FadeUp>

          {/* Currency reference */}
          <FadeUp delay={0.15}>
            <div className="mt-10 bg-[#F8F9FA] rounded-xl p-5 border border-gray-200">
              <p className="text-sm text-[#6B7280] mb-1">
                <strong className="text-[#0F2044]">Currency reference (Professional plan):</strong>{' '}
                R{PRICING.professional.monthly} ≈ $27 USD · R{PRICING.professional.monthly} ≈ €25 EUR · R{PRICING.professional.monthly} ≈ £21 GBP · R{PRICING.professional.monthly} ≈ K534 ZMW · R{PRICING.professional.monthly} ≈ 499 NAD
              </p>
              <p className="text-xs text-[#6B7280]">Rates are indicative. Billing is always in ZAR.</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F9FA] py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-black text-[#0F2044] mb-8 text-center">Frequently Asked Questions</h2>
            {[
              { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. You can change your plan at any time and the difference will be prorated on your next billing cycle.' },
              { q: 'Is there a setup fee?', a: 'No setup fees. Start your free trial immediately with no credit card required.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, EFT bank transfers, and selected mobile money platforms.' },
              { q: 'Do you offer non-profit or NGO discounts?', a: 'Yes. Contact us at sales@borderwatchafrica.com for special pricing.' },
            ].map(({ q, a }, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="mb-4 bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-[#0F2044] mb-2 text-sm">{q}</h3>
                  <p className="text-sm text-[#6B7280]">{a}</p>
                </div>
              </FadeUp>
            ))}
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
