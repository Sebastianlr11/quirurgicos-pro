import React, { useState, useMemo } from 'react';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useOperationStore } from '../stores/useOperationStore';
import { useRecordStore } from '../stores/useRecordStore';
import { EditRecordModal } from './EditRecordModal';
import { WorkRecord } from '../types';
import { Search, PlusCircle, History, Trash2, TrendingUp, Package, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PayrollEntry: React.FC = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const operations = useOperationStore((s) => s.operations);
  const { records, addRecord, updateRecord, deleteRecord } = useRecordStore();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedOpId, setSelectedOpId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchOp, setSearchOp] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const filteredOps = useMemo(() =>
    operations.filter((op) => op.nombre_operacion.toLowerCase().includes(searchOp.toLowerCase())),
    [operations, searchOp]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedOpId || quantity <= 0) return;

    const op = operations.find((o) => o.id === selectedOpId);
    if (!op) return;

    const { error } = await addRecord({
      employee_id: selectedEmpId,
      operation_id: selectedOpId,
      quantity,
      date,
      snapshot_operation_name: op.nombre_operacion,
      snapshot_unit_price: op.valor_cop,
    });

    if (error) toast.error(error);
    else {
      toast.success('Registro agregado');
      setQuantity(1);
      setSelectedOpId('');
      setSearchOp('');
    }
  };

  const recentRecords = useMemo(() =>
    [...records].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 10),
    [records]
  );

  const getEmpName = (id: string) => employees.find((e) => e.id === id)?.full_name || 'Desconocido';

  const confirmDeleteSingle = async () => {
    if (!deletingRecordId) return;
    const { error } = await deleteRecord(deletingRecordId);
    if (error) toast.error(error);
    else toast.success('Registro eliminado');
    setDeletingRecordId(null);
  };

  const handleEditSave = async (id: string, updates: Partial<WorkRecord>) => {
    const { error } = await updateRecord(id, updates);
    if (error) toast.error(error);
    else toast.success('Registro actualizado');
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          employees={employees}
          operations={operations}
          onSave={handleEditSave}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingRecordId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fecaca, #fca5a5)' }}>
                <Trash2 className="text-red-700" size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Eliminar Registro</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              ¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingRecordId(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                Cancelar
              </button>
              <button onClick={confirmDeleteSingle} className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><PlusCircle className="text-white" size={28} /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Registrar Producción</h1>
              <p className="text-white/90">Agrega las operaciones del día</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium">Total Hoy</p>
            <p className="text-3xl font-bold text-white">{records.filter((r) => r.date === date).length}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="stat-card group bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-t-xl" style={{ background: 'linear-gradient(90deg, #14b8a6, #06b6d4)' }} />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Empleado</label>
                  <select required value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="input-premium w-full">
                    <option value="">Seleccionar empleado...</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Fecha</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-premium w-full" />
                </div>
              </div>

              {/* Operation Search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Operación / Actividad</label>
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input type="text" placeholder="Buscar operación..." value={searchOp} onChange={(e) => setSearchOp(e.target.value)} className="input-premium w-full pl-12" />
                </div>
                <div className="border-2 border-slate-200 dark:border-slate-600 rounded-xl max-h-64 overflow-y-auto bg-gray-50 dark:bg-slate-800/70">
                  {filteredOps.length > 0 ? filteredOps.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => { setSelectedOpId(op.id); setSearchOp(op.nombre_operacion); }}
                      className={`px-5 py-3 cursor-pointer text-sm flex justify-between items-center transition-all ${
                        selectedOpId === op.id
                          ? 'bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-900 dark:text-teal-200 font-semibold shadow-sm'
                          : 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0'
                      }`}
                    >
                      <span className="flex-1">{op.nombre_operacion}</span>
                      <span className={`font-mono font-bold ml-4 px-3 py-1 rounded-lg ${
                        op.valor_cop < 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        selectedOpId === op.id ? 'bg-white/70 dark:bg-slate-600 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        ${op.valor_cop.toLocaleString()}
                      </span>
                    </div>
                  )) : (
                    <div className="p-8 text-center">
                      <Package size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-400 font-medium">No se encontraron operaciones</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity + Submit */}
              <div className="flex items-end gap-4 pt-2">
                <div className="w-40">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Cantidad</label>
                  <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} className="input-premium w-full text-center font-bold text-2xl" />
                </div>
                <button type="submit" disabled={!selectedEmpId || !selectedOpId || quantity <= 0} className="flex-1 flex items-center justify-center gap-2 py-4 px-6 text-white rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: (!selectedEmpId || !selectedOpId || quantity <= 0) ? '#94a3b8' : 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
                  <PlusCircle size={22} /> Agregar Registro
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent History */}
        <div className="lg:col-span-1">
          <div className="stat-card h-full flex flex-col bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', maxHeight: 'calc(100vh - 300px)' }}>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-slate-100 dark:border-slate-700">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                <History className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Recientes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Últimos 10 registros</p>
              </div>
              <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {recentRecords.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ scrollbarWidth: 'thin' }}>
              {recentRecords.map((rec, idx) => (
                <div key={rec.id} className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm relative hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: rec.snapshot_unit_price < 0 ? '#ef4444' : 'linear-gradient(135deg, #14b8a6, #06b6d4)' }} />
                      {getEmpName(rec.employee_id)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{rec.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium mb-3 line-clamp-2">{rec.snapshot_operation_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                      x{rec.quantity}
                    </span>
                    <span className={`font-bold text-lg bg-clip-text text-transparent ${rec.snapshot_unit_price < 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-teal-600 to-cyan-600'}`}>
                      ${(rec.snapshot_unit_price * rec.quantity).toLocaleString()}
                    </span>
                  </div>
                  {/* Action buttons - ALWAYS VISIBLE */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <button onClick={() => setEditingRecord(rec)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all">
                      <Edit2 size={13} /> Editar
                    </button>
                    <button onClick={() => setDeletingRecordId(rec.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {recentRecords.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-6 rounded-full mb-4 mx-auto w-fit" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                    <TrendingUp size={48} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No hay registros recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
