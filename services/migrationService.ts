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
    // 1. Migrate employees (deduplicate by documentId first)
    if (oldEmps.length > 0) {
      // Deduplicate: keep last occurrence of each documentId
      const empsByDoc = new Map<string, LegacyEmployee>();
      oldEmps.forEach((e) => empsByDoc.set(e.documentId, e));
      const uniqueEmps = Array.from(empsByDoc.values());

      // Insert one by one to handle conflicts gracefully
      for (const oldEmp of uniqueEmps) {
        const row = {
          user_id: userId,
          full_name: oldEmp.fullName,
          document_id: oldEmp.documentId,
          document_type: oldEmp.documentType || 'C.C.',
          position: oldEmp.position || 'Operario',
          is_active: true,
        };

        // Try insert, if conflict then fetch existing
        const { data: inserted, error: insertErr } = await supabase
          .from('employees')
          .insert(row)
          .select()
          .maybeSingle();

        if (inserted) {
          empIdMap[oldEmp.id] = inserted.id;
        } else if (insertErr) {
          // Probably duplicate - fetch existing
          const { data: existing } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', userId)
            .eq('document_id', oldEmp.documentId)
            .maybeSingle();
          if (existing) empIdMap[oldEmp.id] = existing.id;
        }
      }

      // Also map any duplicate old employees to the same new ID
      oldEmps.forEach((oldEmp) => {
        if (!empIdMap[oldEmp.id]) {
          const canonical = empsByDoc.get(oldEmp.documentId);
          if (canonical && empIdMap[canonical.id]) {
            empIdMap[oldEmp.id] = empIdMap[canonical.id];
          }
        }
      });
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
        .filter((r) => empIdMap[r.employeeId])
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
