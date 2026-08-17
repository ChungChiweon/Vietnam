import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { buildSignUpMetadata, loadMemberProfile, type BusinessProfile, type Profile, type RegistrationInput } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  businessProfile: BusinessProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegistrationInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const syncUser = useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setProfile(null);
      setBusinessProfile(null);
      setLoading(false);
      return;
    }
    const member = await loadMemberProfile(nextUser);
    setProfile(member.profile);
    setBusinessProfile(member.businessProfile);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getUser().then(({ data }) => syncUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { void syncUser(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, [syncUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    businessProfile,
    loading,
    configured: isSupabaseConfigured,
    signIn: async (email, password) => {
      if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (input) => {
      if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: buildSignUpMetadata(input) },
      });
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [businessProfile, loading, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

