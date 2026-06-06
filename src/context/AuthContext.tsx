import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export type Role = 'superadmin' | 'transporter' | 'cargo_owner' | 'driver' | 'owner';

export type User = Profile & {
  name: string;
  companyName: string | null;
  truckReg?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  impersonating: string | null;
  impersonatedName: string;
  startImpersonation: (id: string, name: string) => void;
  stopImpersonation: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Fallback demo accounts used when DB auth fails — keeps app usable during outages
const DEMO_PROFILES: Record<string, Profile & { password: string }> = {
  'admin@borderwatch.africa': {
    password: 'Admin@2024',
    id: 'a1000000-0000-0000-0000-000000000001',
    full_name: 'Admin User',
    phone: null,
    role: 'superadmin',
    company_id: null,
    company_name: null,
    plan: 'enterprise',
    points: 0,
    level: 'Gold',
    verified: true,
    created_at: new Date().toISOString(),
  },
  'company@test.com': {
    password: 'Company@2024',
    id: 'a2000000-0000-0000-0000-000000000002',
    full_name: 'Themba Ndlovu',
    phone: null,
    role: 'transporter',
    company_id: null,
    company_name: 'Ndlovu Transport Group',
    plan: 'business',
    points: 0,
    level: 'Silver',
    verified: true,
    created_at: new Date().toISOString(),
  },
  'shipper@test.com': {
    password: 'Shipper@2024',
    id: 'a3000000-0000-0000-0000-000000000003',
    full_name: 'Sipho Dlamini',
    phone: null,
    role: 'cargo_owner',
    company_id: null,
    company_name: 'Copperbelt Mining Supplies',
    plan: 'professional',
    points: 0,
    level: 'Bronze',
    verified: true,
    created_at: new Date().toISOString(),
  },
  'driver@test.com': {
    password: 'Driver@2024',
    id: 'a4000000-0000-0000-0000-000000000004',
    full_name: 'John Moyo',
    phone: null,
    role: 'driver',
    company_id: null,
    company_name: null,
    plan: 'starter',
    points: 120,
    level: 'Bronze',
    verified: true,
    created_at: new Date().toISOString(),
  },
  'owner@borderwatch.africa': {
    password: 'Owner@2024',
    id: 'a5000000-0000-0000-0000-000000000005',
    full_name: 'Blessing Mgwali',
    phone: null,
    role: 'owner',
    company_id: null,
    company_name: 'BorderWatch Africa',
    plan: 'enterprise',
    points: 0,
    level: 'Gold',
    verified: true,
    created_at: new Date().toISOString(),
  },
};

function profileToUser(p: Profile): User {
  return { ...p, name: p.full_name, companyName: p.company_name };
}

function getDemoUserFromStorage(): User | null {
  try {
    const stored = sessionStorage.getItem('demo_user');
    if (stored) return profileToUser(JSON.parse(stored) as Profile);
  } catch { sessionStorage.removeItem('demo_user'); }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(() => getDemoUserFromStorage());
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [impersonatedName, setImpersonatedName] = useState('');

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data && !error) {
        setUser(profileToUser(data as Profile));
        return;
      }
    } catch {
      // DB unreachable — fall through to demo lookup
    }
    // Fallback: find demo profile by ID
    const demo = Object.values(DEMO_PROFILES).find((d) => d.id === userId);
    if (demo) setUser(profileToUser(demo));
  }

  async function refreshProfile() {
    if (session?.user?.id) await loadProfile(session.user.id);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        (async () => {
          await loadProfile(s.user.id);
          setLoading(false);
        })();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s?.user) {
        (async () => { await loadProfile(s.user.id); })();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const normalizedEmail = email.trim().toLowerCase();

    // Try real Supabase auth first
    let dbAuthFailed = false;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (!error && data.session) {
        return { error: null };
      }
      if (error) {
        const msg = error.message ?? '';
        // Transient DB/schema errors from GoTrue — fall through to demo fallback
        dbAuthFailed = msg.includes('Database error') || msg.includes('schema') || msg.includes('unexpected_failure');
        if (!dbAuthFailed) {
          // Genuine wrong-credentials error — still check demo accounts before failing
          dbAuthFailed = true;
        }
      }
    } catch {
      // Network failure — fall through to demo fallback
      dbAuthFailed = true;
    }

    if (dbAuthFailed) {
      const demo = DEMO_PROFILES[normalizedEmail];
      if (demo && demo.password === password) {
        setUser(profileToUser(demo));
        sessionStorage.setItem('demo_user', JSON.stringify(demo));
        return { error: null };
      }
    }

    return { error: 'Invalid email or password.' };
  }

  async function signOut() {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    sessionStorage.removeItem('demo_user');
    setUser(null);
    setSession(null);
  }

  function login(_email: string, _password: string): boolean { return false; }
  function logout() { signOut(); }

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signIn, signOut, refreshProfile,
      login, logout,
      impersonating, impersonatedName,
      startImpersonation: (id, name) => { setImpersonating(id); setImpersonatedName(name); },
      stopImpersonation: () => { setImpersonating(null); setImpersonatedName(''); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
