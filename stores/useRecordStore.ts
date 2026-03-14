import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { WorkRecord } from '../types';

interface RecordState {
  records: WorkRecord[];
  loading: boolean;
  fetchRecords: (startDate?: string, endDate?: string) => Promise<void>;
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
    set({ loading: false });
  },

  addRecord: async (rec) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const { data, error } = await supabase
      .from('work_records')
      .insert({ ...rec, user_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };
    set({ records: [data as WorkRecord, ...get().records] });
    return { error: null };
  },

  updateRecord: async (id, updates) => {
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
  },

  deleteRecord: async (id) => {
    const { error } = await supabase
      .from('work_records')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    set({ records: get().records.filter((r) => r.id !== id) });
    return { error: null };
  },

  deleteRecords: async (startDate?: string, endDate?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
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
