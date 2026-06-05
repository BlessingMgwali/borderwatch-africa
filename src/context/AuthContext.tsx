import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Role = 'superadmin' | 'transporter' | 'cargo_owner' | 'driver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  companyId?: string;
  companyName?: string;
  industry?: string;
  points?: number;
  level?: string;
  truckReg?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  impersonating: string | null;
  impersonatedName: string;
  startImpersonation: (id: string, name: string) => void;
  stopImpersonation: () => void;
}

const MOCK_USERS: Record<string, User> = {
  'admin@borderwatch.africa': {
    id: 'su-001',
    email: 'admin@borderwatch.africa',
    name: 'Admin User',
    role: 'superadmin',
    plan: 'enterprise',
  },
  'company@test.com': {
    id: 'tr-001',
    email: 'company@test.com',
    name: 'Themba Ndlovu',
    role: 'transporter',
    plan: 'business',
    companyId: 'comp-001',
    companyName: 'Ndlovu Transport Group',
  },
  'shipper@test.com': {
    id: 'co-001',
    email: 'shipper@test.com',
    name: 'Sipho Dlamini',
    role: 'cargo_owner',
    plan: 'starter',
    companyId: 'shp-001',
    companyName: 'Copperbelt Mining Supplies',
    industry: 'Mining & Resources',
  },
  'driver@test.com': {
    id: 'dr-001',
    email: 'driver@test.com',
    name: 'Peter Dube',
    role: 'driver',
    plan: 'starter',
    points: 1240,
    level: 'Gold',
    truckReg: 'GP 123-456',
  },
  'owner@borderwatch.africa': {
    id: 'su-002',
    email: 'owner@borderwatch.africa',
    name: 'Platform Owner',
    role: 'superadmin',
    plan: 'enterprise',
  },
};

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@borderwatch.africa': 'admin123',
  'company@test.com': 'company123',
  'shipper@test.com': 'shipper123',
  'driver@test.com': 'driver123',
  'owner@borderwatch.africa': 'owner123',
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem('bw_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [impersonatedName, setImpersonatedName] = useState('');

  const login = useCallback((email: string, password: string): boolean => {
    const u = MOCK_USERS[email.toLowerCase()];
    if (!u || MOCK_PASSWORDS[email.toLowerCase()] !== password) return false;
    setUser(u);
    sessionStorage.setItem('bw_user', JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setImpersonating(null);
    sessionStorage.removeItem('bw_user');
  }, []);

  const startImpersonation = useCallback((id: string, name: string) => {
    setImpersonating(id);
    setImpersonatedName(name);
  }, []);

  const stopImpersonation = useCallback(() => {
    setImpersonating(null);
    setImpersonatedName('');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, impersonating, impersonatedName, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
