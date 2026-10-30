'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from './api';
import type { User } from './types';

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  refresh: () => Promise<User | null>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  refresh: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return null;
    }
    try {
      const u = await api<User>('/auth/me');
      setUser(u);
      return u;
    } catch {
      tokenStore.clear();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    // Sesión vencida en cualquier llamada → se limpia
    const onUnauthorized = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener('aitrava:unauthorized', onUnauthorized);
    return () => window.removeEventListener('aitrava:unauthorized', onUnauthorized);
  }, [refresh]);

  const signIn = useCallback((token: string, u: User) => {
    tokenStore.set(token);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
