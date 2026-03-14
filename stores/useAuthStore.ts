import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | 'pending';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    set({ session, user, loading: false });

    if (user) {
      await get().fetchProfile();
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      set({ session, user });
      if (user) {
        await get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      set({ profile: data as UserProfile });
    } else if (!data && !error) {
      // No profile exists yet - create one as pending
      const { data: created } = await supabase
        .from('user_profiles')
        .insert({ id: user.id, email: user.email || '', role: 'pending' })
        .select()
        .maybeSingle();
      if (created) set({ profile: created as UserProfile });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Profile will be fetched by onAuthStateChange
    // But we need to wait a moment for it
    await get().fetchProfile();

    const profile = get().profile;
    if (profile && profile.role === 'pending') {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null });
      return { error: 'Tu cuenta aún no ha sido aprobada por un administrador.' };
    }

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  isAdmin: () => get().profile?.role === 'admin',
}));
