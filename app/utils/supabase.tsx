import { createClient, Session, User } from "@supabase/supabase-js";
import LargeSecureStore from "./large-secure-storage";
import { createContext, useContext, useEffect, useState } from "react";
import Login from "@/components/login";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

type UserContext = Session | "loading" | null;
const SupabaseAuthContext = createContext<UserContext>("loading");

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserContext>("loading");

  useEffect(function syncAuthState() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseAuthContext.Provider value={user}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function SignedIn({
  children,
  fallback,
}: {
  children: ({ session }: { session: Session }) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const user = useContext(SupabaseAuthContext);
  if (user === "loading") {
    console.log("SignedIn reached while user information is loading");
    return null;
  }
  if (!user) return fallback ?? <Login />;
  return children({ session: user });
}
