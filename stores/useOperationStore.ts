import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { Operation } from '../types';

interface OperationState {
  operations: Operation[];
  loading: boolean;
  fetchOperations: () => Promise<void>;
  addOperation: (op: Omit<Operation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  updateOperation: (id: string, data: Partial<Operation>) => Promise<{ error: string | null }>;
  deleteOperation: (id: string) => Promise<{ error: string | null }>;
  importOperations: (ops: { nombre_operacion: string; valor_cop: number }[]) => Promise<{ error: string | null }>;
}

export const useOperationStore = create<OperationState>((set, get) => ({
  operations: [],
  loading: false,

  fetchOperations: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('is_active', true)
      .order('nombre_operacion');

    if (!error && data) {
      set({ operations: data as Operation[] });
    }
    set({ loading: false });
  },

  addOperation: async (op) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const { data, error } = await supabase
      .from('operations')
      .insert({ ...op, user_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };
    set({ operations: [...get().operations, data as Operation] });
    return { error: null };
  },

  updateOperation: async (id, updates) => {
    const { data, error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    set({
      operations: get().operations.map((o) => (o.id === id ? (data as Operation) : o)),
    });
    return { error: null };
  },

  deleteOperation: async (id) => {
    // Soft delete
    const { error } = await supabase
      .from('operations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return { error: error.message };
    set({ operations: get().operations.filter((o) => o.id !== id) });
    return { error: null };
  },

  importOperations: async (ops) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const rows = ops.map((o) => ({
      nombre_operacion: o.nombre_operacion,
      valor_cop: o.valor_cop,
      is_deduction: o.valor_cop < 0,
      is_active: true,
      user_id: user.id,
    }));

    const { error } = await supabase.from('operations').insert(rows);
    if (error) return { error: error.message };
    await get().fetchOperations();
    return { error: null };
  },
}));
