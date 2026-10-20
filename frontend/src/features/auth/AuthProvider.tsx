import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SessionView } from '@/shared/api/generated';
import { ApiProblem } from '@/shared/api/problem';
import { clearApiSecurityState } from '@/shared/api/apiClient';
import * as authApi from './authApi';

interface AuthContextValue {
  session: SessionView | null;
  loading: boolean;
  signIn(login: string, password: string): Promise<SessionView>;
  signOut(): Promise<void>;
  reload(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const reload = useCallback(async () => {
    try { setSession(await authApi.getSession()); }
    catch (error) {
      if (!(error instanceof ApiProblem) || error.problem.status !== 401) throw error;
      setSession(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    async signIn(loginName, password) {
      const created = await authApi.login(loginName, password);
      setSession(created);
      return created;
    },
    async signOut() {
      try { await authApi.logout(); } finally {
        setSession(null); clearApiSecurityState(); queryClient.clear();
      }
    },
    reload
  }), [loading, queryClient, reload, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider ausente');
  return value;
}

