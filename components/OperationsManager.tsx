import React, { useState, useRef, useMemo } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { Operation, RawOperationImport } from '../types';
import { Upload, Download, Plus, Trash2, Edit2, Save, X, Filter, Tag, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const OperationsManager: React.FC = () => {
  const { operations, addOperation, updateOperation, deleteOperation, importOperations } = useOperationStore();
  const { categories } = useCategoryStore();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; val: string; categoryId: string; isDeduction: boolean }>({ name: '', val: '', categoryId: '', isDeduction: false });
  const [deletingOp, setDeletingOp] = useState<Operation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newOpName, setNewOpName] = useState('');
  const [newOpVal, setNewOpVal] = useState('');
  const [newOpCategory, setNewOpCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOps = useMemo(() => {
    return operations.filter((op) => {
      const matchesCategory = !filterCategory || op.category_id === filterCategory;
      const matchesSearch = !searchTerm || op.nombre_operacion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [operations, filterCategory, searchTerm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as RawOperationImport[];
        if (Array.isArray(json)) {
          const { error } = await importOperations(json);
          if (error) toast.error(error);
          else toast.success('Operaciones importadas');
        }
      } catch {
        toast.error('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    const exportData: RawOperationImport[] = operations.map((op) => ({
      nombre_operacion: op.nombre_operacion,
      valor_cop: op.valor_cop,
    }));
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    a.download = 'lista_precios.json';
    a.click();
  };

  const handleAdd = async () => {
    if (!newOpName || !newOpVal) return;
    const val = parseFloat(newOpVal);
    const { error } = await addOperation({
      nombre_operacion: newOpName,
      valor_cop: val,
      category_id: newOpCategory || null,
      is_deduction: val < 0,
      is_active: true,
    });
    if (error) toast.error(error);
    else {
      toast.success('Operación agregada');
      setNewOpName(''); setNewOpVal(''); setNewOpCategory('');
    }
  };

  const confirmDelete = async () => {
    if (!deletingOp) return;
    const { error } = await deleteOperation(deletingOp.id);
    if (error) toast.error(error);
    else toast.success(`"${deletingOp.nombre_operacion}" eliminada`);
    setDeletingOp(null);
  };

  const startEdit = (op: Operation) => {
    setIsEditing(op.id);
    setEditForm({
      name: op.nombre_operacion,
      val: op.valor_cop.toString(),
      categoryId: op.category_id || '',
      isDeduction: op.is_deduction,
    });
  };

  const saveEdit = async (id: string) => {
    const val = parseFloat(editForm.val);
    if (!editForm.name || isNaN(val)) {
      toast.error('Nombre y valor son requeridos');
      return;
    }
    const updates: any = {
      nombre_operacion: editForm.name,
      valor_cop: val,
      is_deduction: val < 0,
    };
    // Only include category_id if it has a value, otherwise set to null
    updates.category_id = editForm.categoryId || null;

    const { error } = await updateOperation(id, updates);
    if (error) {
      toast.error('Error al guardar: ' + error);
    } else {
      toast.success(`"${editForm.name}" actualizada correctamente`);
      setIsEditing(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Delete confirmation modal */}
      {deletingOp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fecaca, #fca5a5)' }}>
                <AlertTriangle className="text-red-700" size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Eliminar Operación</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              ¿Estás seguro de que quieres eliminar esta operación?
            </p>
            <p className="font-bold text-slate-800 dark:text-white mb-6">
              "{deletingOp.nombre_operacion}" - ${deletingOp.valor_cop.toLocaleString()}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingOp(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lista de Precios</h2>
          <p className="text-slate-500 text-sm">Gestiona los valores por operación.</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
            <Upload size={16} /> Importar JSON
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
            <Download size={16} /> Descargar JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Buscar operación..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-premium w-full pl-10 text-sm" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-premium text-sm py-2">
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Add Row */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 flex-wrap">
          <input type="text" placeholder="Nombre operación" value={newOpName} onChange={(e) => setNewOpName(e.target.value)} className="flex-1 min-w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input type="number" placeholder="Valor" value={newOpVal} onChange={(e) => setNewOpVal(e.target.value)} className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <select value={newOpCategory} onChange={(e) => setNewOpCategory(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Operación</th>
                <th className="px-6 py-3 font-semibold">Categoría</th>
                <th className="px-6 py-3 font-semibold text-right">Valor (COP)</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOps.map((op) => {
                const cat = categories.find((c) => c.id === op.category_id);
                return (
                  <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-3">
                      {isEditing === op.id ? (
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1 border rounded" />
                      ) : (
                        <span className="font-medium text-slate-700">{op.nombre_operacion}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isEditing === op.id ? (
                        <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className="px-2 py-1 border rounded text-sm">
                          <option value="">Sin categoría</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : (
                        cat ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                            <Tag size={10} /> {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {isEditing === op.id ? (
                        <input type="number" value={editForm.val} onChange={(e) => setEditForm({ ...editForm, val: e.target.value })} className="w-24 px-2 py-1 border rounded text-right" />
                      ) : (
                        <span className={`font-bold ${op.valor_cop < 0 ? 'text-red-500' : 'text-teal-700'}`}>
                          ${op.valor_cop.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {isEditing === op.id ? (
                          <>
                            <button onClick={() => saveEdit(op.id)} className="text-green-600 hover:text-green-800"><Save size={16} /></button>
                            <button onClick={() => setIsEditing(null)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(op)} className="text-slate-400 hover:text-teal-600"><Edit2 size={16} /></button>
                            <button onClick={() => setDeletingOp(op)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOps.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No hay operaciones registradas. Agrega una o importa un JSON.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
