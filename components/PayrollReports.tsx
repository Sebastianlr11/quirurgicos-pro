import React, { useState, useMemo } from 'react';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useRecordStore } from '../stores/useRecordStore';
import { useOperationStore } from '../stores/useOperationStore';
import { useCompanyStore } from '../stores/useCompanyStore';
import { EditRecordModal } from './EditRecordModal';
import { WorkRecord } from '../types';
import { generatePayslip, generateConsolidatedPayroll } from '../services/pdfService';
import { FileText, ChevronRight, Calculator, Trash2, AlertTriangle, Download, Sparkles, Edit2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const PayrollReports: React.FC = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const operations = useOperationStore((s) => s.operations);
  const { records, updateRecord, deleteRecord, deleteRecords: deleteRecordRange } = useRecordStore();
  const companySettings = useCompanyStore((s) => s.settings);

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'all' | 'range'>('range');
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );

  const filteredRecords = useMemo(() => {
    if (!selectedEmpId) return [];
    return records.filter((r) => r.employee_id === selectedEmpId && r.date >= startDate && r.date <= endDate);
  }, [records, selectedEmpId, startDate, endDate]);

  const recordsInRange = useMemo(() =>
    records.filter((r) => r.date >= startDate && r.date <= endDate).length,
    [records, startDate, endDate]
  );

  const totalAmount = useMemo(() =>
    filteredRecords.reduce((acc, r) => acc + r.quantity * r.snapshot_unit_price, 0),
    [filteredRecords]
  );

  const handlePrint = () => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (emp && filteredRecords.length > 0) {
      generatePayslip(emp, filteredRecords, { start: startDate, end: endDate }, companySettings);
    }
  };

  const handleConsolidatedPdf = () => {
    const rangeRecords = records.filter((r) => r.date >= startDate && r.date <= endDate);
    if (rangeRecords.length === 0) {
      toast.error('No hay registros en este periodo');
      return;
    }
    generateConsolidatedPayroll(employees, rangeRecords, { start: startDate, end: endDate }, companySettings);
    toast.success('PDF consolidado generado');
  };

  const handleDeleteClick = (mode: 'all' | 'range') => {
    setDeleteMode(mode);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteMode === 'all') {
      const { error } = await deleteRecordRange();
      if (error) toast.error(error);
      else toast.success('Todos los registros eliminados');
    } else {
      const { error } = await deleteRecordRange(startDate, endDate);
      if (error) toast.error(error);
      else toast.success('Registros del periodo eliminados');
    }
    setShowDeleteConfirm(false);
    setSelectedEmpId('');
  };

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

      {/* Delete single record confirmation */}
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

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fecaca, #fca5a5)' }}>
                <AlertTriangle className="text-red-700" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {deleteMode === 'all'
                ? <>Eliminar <strong className="text-red-600">TODOS los registros</strong> ({records.length})?</>
                : <>Eliminar registros del <strong className="text-red-600">{startDate} - {endDate}</strong> ({recordsInRange})?</>}
            </p>
            <div className="rounded-xl p-4 mb-6" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #fbbf24' }}>
              <p className="text-sm text-yellow-900"><strong>Advertencia:</strong> Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><FileText className="text-white" size={28} /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Reportes y Nómina</h1>
              <p className="text-white/90">Genera PDFs y gestiona tus registros</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium">Total Registros</p>
            <p className="text-3xl font-bold text-white">{records.length}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Generate Report */}
          <div className="stat-card group bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)' }}>
                <Sparkles className="text-teal-600" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Generar Reporte</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Empleado</label>
                <select className="input-premium w-full" value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}>
                  <option value="">-- Seleccionar Empleado --</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Desde</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-premium w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Hasta</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-premium w-full text-sm" />
                </div>
              </div>
              <div className="pt-4">
                <div className="p-5 rounded-xl text-center relative overflow-hidden shadow-inner bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600">
                  <span className="block text-xs text-teal-700 uppercase font-bold mb-1 tracking-wider">Total a Pagar</span>
                  <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                    ${totalAmount.toLocaleString()}
                  </span>
                  <div className="mt-2 text-xs text-teal-600 font-medium">
                    {filteredRecords.length} {filteredRecords.length === 1 ? 'registro' : 'registros'}
                  </div>
                </div>
              </div>
              <button disabled={!selectedEmpId || filteredRecords.length === 0} onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-5 py-4 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: filteredRecords.length > 0 ? 'linear-gradient(135deg, #14b8a6, #06b6d4)' : '#94a3b8' }}>
                <Download size={20} /> Descargar PDF Individual
              </button>

              {/* Consolidated PDF */}
              <button onClick={handleConsolidatedPdf} disabled={recordsInRange === 0} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: recordsInRange > 0 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#94a3b8' }}>
                <Users size={18} /> Nómina General (Todos)
              </button>
            </div>
          </div>

          {/* Delete Records */}
          <div className="stat-card group" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderRadius: '1.5rem', padding: '1.5rem', border: '2px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #fecaca, #fca5a5)' }}>
                <Trash2 className="text-red-700" size={20} />
              </div>
              <h3 className="text-lg font-bold text-red-900">Limpiar Registros</h3>
            </div>
            <div className="space-y-3">
              <button onClick={() => handleDeleteClick('range')} disabled={recordsInRange === 0} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-40 transition-all shadow-sm border-2 border-red-300">
                <Trash2 size={18} /> Borrar Periodo
                <span className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-bold">{recordsInRange}</span>
              </button>
              <button onClick={() => handleDeleteClick('all')} disabled={records.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold disabled:opacity-40 transition-all shadow-md" style={{ background: records.length > 0 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#94a3b8' }}>
                <Trash2 size={18} /> Borrar TODO
                <span className="ml-auto bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">{records.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right - Details Table */}
        <div className="lg:col-span-2">
          <div className="stat-card h-full flex flex-col bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="p-5 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50" style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
              <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                  <FileText className="text-blue-600" size={20} />
                </div>
                Detalle de Movimientos
              </h3>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0369a1' }}>
                {filteredRecords.length} registros
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedEmpId ? (
                filteredRecords.length > 0 ? (
                  <table className="table-premium w-full">
                    <thead>
                      <tr>
                        <th className="px-5 py-4 font-bold text-xs">FECHA</th>
                        <th className="px-5 py-4 font-bold text-xs">OPERACIÓN</th>
                        <th className="px-5 py-4 font-bold text-xs text-center">CANT.</th>
                        <th className="px-5 py-4 font-bold text-xs text-right">TOTAL</th>
                        <th className="px-5 py-4 font-bold text-xs text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap font-medium text-sm">{rec.date}</td>
                          <td className={`px-5 py-4 font-semibold text-sm ${rec.snapshot_unit_price < 0 ? 'text-red-600' : 'text-slate-800'}`}>{rec.snapshot_operation_name}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-block bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-bold">{rec.quantity}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`font-mono font-bold text-sm ${rec.snapshot_unit_price < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                              ${(rec.quantity * rec.snapshot_unit_price).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingRecord(rec)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-lg transition-all shadow-sm">
                                <Edit2 size={13} /> Editar
                              </button>
                              <button onClick={() => setDeletingRecordId(rec.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-400 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 rounded-lg transition-all shadow-sm">
                                <Trash2 size={13} /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96">
                    <div className="p-6 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                      <Calculator size={64} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">No hay registros para este periodo.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="p-6 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                    <ChevronRight size={64} className="text-blue-400" />
                  </div>
                  <p className="text-slate-400 font-medium text-lg">Selecciona un empleado para ver el detalle</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
