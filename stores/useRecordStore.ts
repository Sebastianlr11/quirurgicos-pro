import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { WorkRecord } from '../types';

interface RecordState {
  records: WorkRecord[];
  loading: boolean;
  fetchRecords: (startDate?: string, endDate?: string) => Promise<{ error: string | null }>;
  addRecord: (rec: Omit<WorkRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  updateRecord: (id: string, data: Partial<WorkRecord>) => Promise<{ error: string | null }>;
  deleteRecord: (id: string) => Promise<{ error: string | null }>;
  deleteRecords: (startDate?: string, endDate?: string) => Promise<{ error: string | null }>;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  loading: false,

  fetchRecords: async (startDate?: string, endDate?: string) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('work_records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (!error && data) {
        set({ records: data as WorkRecord[] });
      }
      return { error: error?.message ?? null };
    } catch (err) {
      return { error: (err as Error).message };
    } finally {
      // Garantiza que loading siempre vuelve a false, incluso si hay una excepción JS
      set({ loading: false });
    }
  },

  addRecord: async (rec) => {
    // Leemos el user del store (síncrono) en vez de getSession() (await que puede colgarse).
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'No autenticado' };

    try {
      const { data, error } = await supabase
        .from('work_records')
        .insert({ ...rec, user_id: user.id })
        .select()
        .single();

      if (error) return { error: error.message };
      set({ records: [data as WorkRecord, ...get().records] });
      return { error: null };
    } catch (err) {
      // Timeout / red caída: devolvemos error claro en vez de colgar el botón para siempre.
      return { error: (err as Error).message || 'Error de conexión. Reintenta.' };
    }
  },

  updateRecord: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('work_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return { error: error.message };
      set({
        records: get().records.map((r) => (r.id === id ? (data as WorkRecord) : r)),
      });
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message || 'Error de conexión. Reintenta.' };
    }
  },

  deleteRecord: async (id) => {
    try {
      const { error } = await supabase
        .from('work_records')
        .delete()
        .eq('id', id);

      if (error) return { error: error.message };
      set({ records: get().records.filter((r) => r.id !== id) });
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message || 'Error de conexión. Reintenta.' };
    }
  },

  deleteRecords: async (startDate?: string, endDate?: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'No autenticado' };

    let query = supabase
      .from('work_records')
      .delete()
      .eq('user_id', user.id);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { error } = await query;
    if (error) return { error: error.message };

    if (!startDate && !endDate) {
      set({ records: [] });
    } else {
      set({
        records: get().records.filter((r) => {
          if (startDate && r.date < startDate) return true;
          if (endDate && r.date > endDate) return true;
          return false;
        }),
      });
    }
    return { error: null };
  },
}));
