import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

// Keep role type exported for use across dashboards
export type Role = 'superadmin' | 'transporter' | 'cargo_owner' | 'driver' | 'owner';

// Unified user type that works like the old User type but maps to Profile
export type User = Profile & {
  name: string;       // alias for full_name
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
  // Legacy compat kept so existing pages compile without changes
  login: (email: string, password: string) => boolean;
  logout: () => void;
  impersonating: string | null;
  impersonatedName: string;
  startImpersonation: (id: string, name: string) => void;
  stopImpersonation: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function profileToUser(p: Profile): User {
  return { ...p, name: p.full_name, companyName: p.company_name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [impersonatedName, setImpersonatedName] = useState('');

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data) setUser(profileToUser(data as Profile));
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  // Legacy sync login shim — used by LoginPage until fully migrated
  function login(_email: string, _password: string): boolean {
    // Async sign-in is handled via signIn; this is a no-op shim
    return false;
  }

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
