import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle Supabase email verification / OAuth redirect by exchanging the auth code for a session
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const errorDescription = url.searchParams.get('error_description');

      if (errorDescription) {
        console.warn('Auth redirect error:', errorDescription);
      }

      if (code) {
        // Exchange the code for a session and clean the URL
        setLoading(true);
        supabase.auth.exchangeCodeForSession(code)
          .then(({ error }) => {
            if (error) {
              console.error('exchangeCodeForSession error:', error);
            }
            // Remove query params to keep clean URLs
            const clean = url.origin + url.pathname;
            window.history.replaceState({}, document.title, clean);
          })
          .finally(() => setLoading(false));
      }
    } catch (e) {
      console.error('Error handling auth redirect:', e);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};