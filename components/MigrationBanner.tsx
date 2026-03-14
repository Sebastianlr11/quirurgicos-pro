import React, { useState, useEffect } from 'react';
import { Database, ArrowRight, X } from 'lucide-react';
import { migrateLocalDataToSupabase } from '../services/migrationService';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useOperationStore } from '../stores/useOperationStore';
import { useRecordStore } from '../stores/useRecordStore';
import toast from 'react-hot-toast';

export const MigrationBanner: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ops = localStorage.getItem('operations');
    const emps = localStorage.getItem('employees');
    const recs = localStorage.getItem('records');
    setHasData(!!(ops || emps || recs));
  }, []);

  if (!hasData || dismissed) return null;

  const handleMigrate = async () => {
    setMigrating(true);
    const { error } = await migrateLocalDataToSupabase();
    if (error) {
      toast.error(`Error en migración: ${error}`);
    } else {
      toast.success('Datos migrados exitosamente a la nube!');
      // Refresh stores
      await Promise.all([
        useEmployeeStore.getState().fetchEmployees(),
        useOperationStore.getState().fetchOperations(),
        useRecordStore.getState().fetchRecords(),
      ]);
      setHasData(false);
    }
    setMigrating(false);
  };

  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800 animate-fade-in bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-800/40">
            <Database className="text-teal-600 dark:text-teal-400" size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm">Datos locales detectados</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tienes datos guardados en el navegador. Migra a la nube para no perderlos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}
          >
            {migrating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><ArrowRight size={16} /> Migrar Ahora</>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
