// ─── Payment config ────────────────────────────────────────────────────────────

export const PAYMENT_CONFIG = {
  currency: 'ZAR',
  commissionByPlan: {
    starter: 0.10,
    professional: 0.08,
    business: 0.06,
    enterprise: 0.04,
  },
  sandbox: true,
  payfast: {
    merchantId: '10000100',
    merchantKey: '46f0cd694581a',
  },
};

export const PRICING = {
  starter: { monthly: 0, annual: 0 },
  professional: { monthly: 499, annual: 399 },
  business: { monthly: 1999, annual: 1599 },
  enterprise: { monthly: 0, annual: 0 },
};

export const AD_PRICING = {
  featuredLoad: 299,
  featuredTruck: 199,
  borderBanner: 1500,
  sponsoredAlert: 500,
  homepageFeature: 5000,
};

export function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function commissionRate(plan: string): number {
  return PAYMENT_CONFIG.commissionByPlan[plan as keyof typeof PAYMENT_CONFIG.commissionByPlan] ?? 0.10;
}

export function platformFee(amount: number, plan: string): number {
  return Math.round(amount * commissionRate(plan));
}

export function carrierReceives(amount: number, plan: string): number {
  return amount - platformFee(amount, plan);
}
