import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { OperationCategory } from '../types';

interface CategoryState {
  categories: OperationCategory[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<{ error: string | null }>;
  updateCategory: (id: string, data: Partial<OperationCategory>) => Promise<{ error: string | null }>;
  deleteCategory: (id: string) => Promise<{ error: string | null }>;
  initDefaults: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('operation_categories')
      .select('*')
      .order('display_order');

    if (!error && data) {
      set({ categories: data as OperationCategory[] });
    }
    set({ loading: false });
  },

  initDefaults: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if categories already exist
    const { data } = await supabase
      .from('operation_categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (data && data.length === 0) {
      await supabase.rpc('create_default_categories', { p_user_id: user.id });
      await get().fetchCategories();
    }
  },

  addCategory: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const maxOrder = Math.max(0, ...get().categories.map((c) => c.display_order));
    const { data, error } = await supabase
      .from('operation_categories')
      .insert({ name, display_order: maxOrder + 1, user_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };
    set({ categories: [...get().categories, data as OperationCategory] });
    return { error: null };
  },

  updateCategory: async (id, updates) => {
    const { data, error } = await supabase
      .from('operation_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    set({
      categories: get().categories.map((c) =>
        c.id === id ? (data as OperationCategory) : c
      ),
    });
    return { error: null };
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('operation_categories')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    set({ categories: get().categories.filter((c) => c.id !== id) });
    return { error: null };
  },
}));
