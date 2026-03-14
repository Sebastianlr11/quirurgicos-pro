import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { Employee } from '../types';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<{ error: string | null }>;
  deleteEmployee: (id: string) => Promise<{ error: string | null }>;
  importEmployees: (emps: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<{ error: string | null }>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  loading: false,

  fetchEmployees: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('full_name');

    if (!error && data) {
      set({ employees: data as Employee[] });
    }
    set({ loading: false });
  },

  addEmployee: async (emp) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const { data, error } = await supabase
      .from('employees')
      .insert({ ...emp, user_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };
    set({ employees: [...get().employees, data as Employee] });
    return { error: null };
  },

  updateEmployee: async (id, updates) => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    set({
      employees: get().employees.map((e) => (e.id === id ? (data as Employee) : e)),
    });
    return { error: null };
  },

  deleteEmployee: async (id) => {
    // Soft delete
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return { error: error.message };
    set({ employees: get().employees.filter((e) => e.id !== id) });
    return { error: null };
  },

  importEmployees: async (emps) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    // Deduplicate by document_id (keep last occurrence)
    const seen = new Map<string, typeof emps[0]>();
    emps.forEach((e) => seen.set(e.document_id, e));
    const unique = Array.from(seen.values());

    // Filter out employees that already exist
    const existing = get().employees.map((e) => e.document_id);
    const newEmps = unique.filter((e) => !existing.includes(e.document_id));
    const updateEmps = unique.filter((e) => existing.includes(e.document_id));

    const errors: string[] = [];

    // Insert new employees
    if (newEmps.length > 0) {
      const rows = newEmps.map((e) => ({ ...e, user_id: user.id }));
      const { error } = await supabase.from('employees').insert(rows);
      if (error) errors.push(error.message);
    }

    // Update existing employees
    for (const emp of updateEmps) {
      const existingEmp = get().employees.find((e) => e.document_id === emp.document_id);
      if (existingEmp) {
        await supabase
          .from('employees')
          .update({ full_name: emp.full_name, document_type: emp.document_type, position: emp.position })
          .eq('id', existingEmp.id);
      }
    }

    await get().fetchEmployees();
    if (errors.length > 0) return { error: errors.join(', ') };
    return { error: null };
  },
}));
