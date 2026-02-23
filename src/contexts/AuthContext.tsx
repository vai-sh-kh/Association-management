import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { IS_DEMO, DEMO_USER_ID, DEMO_USER_EMAIL } from "../constants/demo";
import { supabase } from "../lib/supabase";

const DEMO_USER = {
  id: DEMO_USER_ID,
  email: DEMO_USER_EMAIL,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "",
} as unknown as User;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    if (IS_DEMO) {
      setState({ user: DEMO_USER, session: null, loading: false });
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (IS_DEMO) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (IS_DEMO) return;
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = { ...state, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
