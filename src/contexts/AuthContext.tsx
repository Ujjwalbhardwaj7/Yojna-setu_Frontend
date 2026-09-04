import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { setAccessTokenProvider } from "@/services/api/client";
import { hasSupabaseConfig, supabase } from "@/services/auth/supabase";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "unconfigured";
type Credentials = { email: string; password: string };
type AuthContextValue = {
  state: AuthState;
  user: User | null;
  session: Session | null;
  openAuth: () => void;
  closeAuth: () => void;
  authOpen: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(hasSupabaseConfig ? "loading" : "unconfigured");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession); setUser(nextSession?.user ?? null); setState(nextSession ? "authenticated" : "unauthenticated");
    setAccessTokenProvider(() => nextSession?.access_token ?? null);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) { setAccessTokenProvider(() => null); return; }
    let active = true;
    client.auth.getSession().then(({ data }) => { if (active) applySession(data.session); });
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => applySession(nextSession));
    const refreshAfterUnauthorized = () => { void client.auth.refreshSession().then(({ data }) => applySession(data.session)); };
    window.addEventListener("yojanasetu:unauthorized", refreshAfterUnauthorized);
    return () => { active = false; subscription.subscription.unsubscribe(); window.removeEventListener("yojanasetu:unauthorized", refreshAfterUnauthorized); };
  }, [applySession]);

  const signIn = useCallback(async ({ email, password }: Credentials) => { if (!supabase) throw new Error("Supabase authentication is not configured."); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }, []);
  const signUp = useCallback(async ({ email, password }: Credentials) => { if (!supabase) throw new Error("Supabase authentication is not configured."); const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; }, []);
  const signOut = useCallback(async () => { if (!supabase) return; const { error } = await supabase.auth.signOut(); if (error) throw error; }, []);
  const value = useMemo(() => ({ state, user, session, authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => setAuthOpen(false), signIn, signUp, signOut }), [authOpen, session, signIn, signOut, signUp, state, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
