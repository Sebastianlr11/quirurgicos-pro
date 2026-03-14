import { supabase } from './supabaseClient';
import { LegacyEmployee, LegacyOperation, LegacyWorkRecord } from '../types';

export function hasLocalData(): boolean {
  const ops = localStorage.getItem('operations');
  const emps = localStorage.getItem('employees');
  const recs = localStorage.getItem('records');
  return !!(ops || emps || recs);
}

export async function migrateLocalDataToSupabase(): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const userId = user.id;
  const oldOpsJson = localStorage.getItem('operations');
  const oldEmpsJson = localStorage.getItem('employees');
  const oldRecsJson = localStorage.getItem('records');

  const oldOps: LegacyOperation[] = oldOpsJson ? JSON.parse(oldOpsJson) : [];
  const oldEmps: LegacyEmployee[] = oldEmpsJson ? JSON.parse(oldEmpsJson) : [];
  const oldRecs: LegacyWorkRecord[] = oldRecsJson ? JSON.parse(oldRecsJson) : [];

  // Maps old IDs -> new UUIDs
  const opIdMap: Record<string, string> = {};
  const empIdMap: Record<string, string> = {};

  try {
    // 1. Migrate employees
    if (oldEmps.length > 0) {
      const empRows = oldEmps.map((e) => ({
        user_id: userId,
        full_name: e.fullName,
        document_id: e.documentId,
        document_type: e.documentType || 'C.C.',
        position: e.position || 'Operario',
        is_active: true,
      }));

      const { data: insertedEmps, error: empError } = await supabase
        .from('employees')
        .upsert(empRows, { onConflict: 'user_id,document_id' })
        .select();

      if (empError) return { error: `Error migrando empleados: ${empError.message}` };

      if (insertedEmps) {
        // Map old IDs by matching document_id
        oldEmps.forEach((oldEmp) => {
          const match = insertedEmps.find((e: any) => e.document_id === oldEmp.documentId);
          if (match) empIdMap[oldEmp.id] = match.id;
        });
      }
    }

    // 2. Migrate operations
    if (oldOps.length > 0) {
      const opRows = oldOps.map((o) => ({
        user_id: userId,
        nombre_operacion: o.nombre_operacion,
        valor_cop: o.valor_cop,
        is_deduction: o.valor_cop < 0,
        is_active: true,
      }));

      const { data: insertedOps, error: opError } = await supabase
        .from('operations')
        .insert(opRows)
        .select();

      if (opError) return { error: `Error migrando operaciones: ${opError.message}` };

      if (insertedOps) {
        oldOps.forEach((oldOp, idx) => {
          if (insertedOps[idx]) {
            opIdMap[oldOp.id] = insertedOps[idx].id;
          }
        });
      }
    }

    // 3. Migrate work records
    if (oldRecs.length > 0) {
      const recRows = oldRecs
        .filter((r) => empIdMap[r.employeeId]) // Only records with mapped employees
        .map((r) => ({
          user_id: userId,
          employee_id: empIdMap[r.employeeId],
          operation_id: opIdMap[r.operationId] || null,
          quantity: r.quantity,
          date: r.date,
          snapshot_operation_name: r.snapshotOperationName,
          snapshot_unit_price: r.snapshotUnitPrice,
        }));

      if (recRows.length > 0) {
        const { error: recError } = await supabase
          .from('work_records')
          .insert(recRows);

        if (recError) return { error: `Error migrando registros: ${recError.message}` };
      }
    }

    // 4. Clean up localStorage
    localStorage.removeItem('operations');
    localStorage.removeItem('employees');
    localStorage.removeItem('records');

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Error desconocido durante la migración' };
  }
}
