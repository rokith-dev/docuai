"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthContextValue { user: User | null; session: Session | null; loading: boolean; signOut: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue>({ user: null, session: null, loading: true, signOut: async () => undefined });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() { if (supabase) await supabase.auth.signOut(); }
  return <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
