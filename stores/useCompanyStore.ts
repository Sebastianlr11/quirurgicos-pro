import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { CompanySettings } from '../types';

const DEFAULT_SETTINGS: CompanySettings = {
  company_name: 'Confecciones Quirúrgicas',
  address: '',
  phone: '',
  nit: '',
  email: '',
  logo_url: '',
};

interface CompanyState {
  settings: CompanySettings;
  loading: boolean;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<CompanySettings>) => Promise<{ error: string | null }>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    // Prevent duplicate fetches
    if (get().loaded || get().loading) return;

    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        set({ settings: data as CompanySettings, loaded: true });
      } else {
        // No settings exist - create defaults
        const { data: created, error: insertError } = await supabase
          .from('company_settings')
          .insert({ ...DEFAULT_SETTINGS, user_id: user.id })
          .select()
          .maybeSingle();

        if (created) {
          set({ settings: created as CompanySettings, loaded: true });
        } else {
          // If insert fails (maybe row already exists from race condition), try fetching again
          const { data: retry } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          if (retry) set({ settings: retry as CompanySettings, loaded: true });
          else set({ settings: DEFAULT_SETTINGS, loaded: true });
        }
      }
    } catch (err) {
      set({ settings: DEFAULT_SETTINGS, loaded: true });
    }
    set({ loading: false });
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    if (!current.id) {
      // Try to fetch first
      await get().fetchSettings();
      const refreshed = get().settings;
      if (!refreshed.id) return { error: 'No se encontró configuración' };
    }

    const { data, error } = await supabase
      .from('company_settings')
      .update(updates)
      .eq('id', get().settings.id!)
      .select()
      .single();

    if (error) return { error: error.message };
    set({ settings: data as CompanySettings });
    return { error: null };
  },
}));
