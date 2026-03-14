import React, { useState, useRef } from 'react';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { Employee } from '../types';
import { EditEmployeeModal } from './EditEmployeeModal';
import { Upload, Download, Plus, Trash2, User, Users, UserPlus, Shield, Edit2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmployeeManager: React.FC = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee, importEmployees } = useEmployeeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newName, setNewName] = useState('');
  const [newDocType, setNewDocType] = useState('C.C.');
  const [newDoc, setNewDoc] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.document_id.includes(searchTerm)
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const isSpanishFormat = json.some((i: any) => i.nombre || i.documento_numero);
          const isInternalFormat = json.some((i: any) => i.fullName || i.full_name);

          let emps: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];
          if (isSpanishFormat) {
            emps = json.map((item: any) => ({
              full_name: item.nombre || 'Sin Nombre',
              document_id: item.documento_numero ? String(item.documento_numero) : 'Sin ID',
              document_type: item.documento_tipo || 'C.C.',
              position: item.cargo || 'Operario',
              is_active: true,
            }));
          } else if (isInternalFormat) {
            emps = json.map((item: any) => ({
              full_name: item.fullName || item.full_name || 'Sin Nombre',
              document_id: item.documentId || item.document_id || 'Sin ID',
              document_type: item.documentType || item.document_type || 'C.C.',
              position: item.position || 'Operario',
              is_active: true,
            }));
          }

          if (emps.length > 0) {
            const { error } = await importEmployees(emps);
            if (error) toast.error(error);
            else toast.success(`${emps.length} empleados importados`);
          } else {
            toast.error('Formato de JSON no reconocido');
          }
        }
      } catch {
        toast.error('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'empleados.json';
    a.click();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDoc) return;

    // Check duplicate document
    if (employees.some((emp) => emp.document_id === newDoc)) {
      toast.error('Ya existe un empleado con este documento');
      return;
    }

    const { error } = await addEmployee({
      full_name: newName,
      document_id: newDoc,
      document_type: newDocType,
      position: newRole || 'Operario',
      is_active: true,
    });
    if (error) toast.error(error);
    else {
      toast.success('Empleado registrado');
      setNewName(''); setNewDoc(''); setNewRole('');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await deleteEmployee(id);
    if (error) toast.error(error);
    else toast.success(`${name} eliminado`);
  };

  const handleEditSave = async (id: string, updates: Partial<Employee>) => {
    const { error } = await updateEmployee(id, updates);
    if (error) toast.error(error);
    else toast.success('Empleado actualizado');
    setEditingEmployee(null);
  };

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-32 rounded-2xl" /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}</div></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onSave={handleEditSave}
          onClose={() => setEditingEmployee(null)}
        />
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Users className="text-white" size={28} /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Empleados</h1>
              <p className="text-white/90">Registra y gestiona tu equipo de trabajo</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium">Total Activos</p>
            <p className="text-3xl font-bold text-white">{employees.length}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      {/* Search + Import/Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium w-full pl-12"
          />
        </div>
        <div className="flex gap-3">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-teal-200 text-teal-700 rounded-xl hover:bg-teal-50 font-semibold transition-all shadow-sm">
            <Upload size={18} /> Importar
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
            <Download size={18} /> Descargar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="stat-card group sticky top-4 bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)' }}>
                <UserPlus className="text-teal-600" size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Nuevo Empleado</h3>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Nombre Completo</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="input-premium w-full" placeholder="Ej. Juan Pérez" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Tipo</label>
                  <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="input-premium w-full text-sm">
                    <option value="C.C.">C.C.</option>
                    <option value="PPT">PPT</option>
                    <option value="C.E.">C.E.</option>
                    <option value="T.I.">T.I.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Documento ID</label>
                  <input type="text" required value={newDoc} onChange={(e) => setNewDoc(e.target.value)} className="input-premium w-full" placeholder="123456789" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Cargo (Opcional)</label>
                <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-premium w-full" placeholder="Ej. Operario de Confección" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-2" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
                <Plus size={20} /> Registrar Empleado
              </button>
            </form>
          </div>
        </div>

        {/* Employee List */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          {filteredEmployees.map((emp, idx) => (
            <div key={emp.id} className="stat-card group flex items-start justify-between hover-lift animate-fade-in bg-white dark:bg-slate-800" style={{ borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', animationDelay: `${idx * 0.05}s` }}>
              <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-t-xl" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)' }}>
                  <User className="text-teal-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{emp.full_name}</h4>
                  <div className="flex items-center gap-2 text-xs mb-1.5">
                    <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)', color: '#0f766e' }}>
                      {emp.document_type || 'ID'}
                    </span>
                    <span className="text-slate-500 font-medium">{emp.document_id}</span>
                  </div>
                  <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#14b8a6' }}>
                    <Shield size={12} /> {emp.position || 'Operario'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEditingEmployee(emp)} className="p-2 text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-lg transition-all shadow-sm" title="Editar">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(emp.id, emp.full_name)} className="p-2 text-white bg-red-400 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 rounded-lg transition-all shadow-sm" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-16 rounded-2xl text-center bg-gray-50 dark:bg-slate-800/70" style={{ border: '2px dashed #e5e7eb' }}>
              <div className="p-6 rounded-full mb-4 mx-auto w-fit" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)' }}>
                <Users size={48} className="text-teal-300" />
              </div>
              <p className="text-slate-400 font-medium text-lg">{searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}</p>
              <p className="text-slate-300 text-sm mt-1">{searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega tu primer empleado usando el formulario'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
