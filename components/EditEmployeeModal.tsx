import React, { useState } from 'react';
import { Employee } from '../types';
import { X, Save } from 'lucide-react';

interface EditEmployeeModalProps {
  employee: Employee;
  onSave: (id: string, updates: Partial<Employee>) => void;
  onClose: () => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee, onSave, onClose,
}) => {
  const [fullName, setFullName] = useState(employee.full_name);
  const [documentId, setDocumentId] = useState(employee.document_id);
  const [documentType, setDocumentType] = useState(employee.document_type);
  const [position, setPosition] = useState(employee.position);

  const handleSave = () => {
    if (!fullName || !documentId) return;
    onSave(employee.id, {
      full_name: fullName,
      document_id: documentId,
      document_type: documentType,
      position: position,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Editar Empleado</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-premium w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Tipo Doc</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="input-premium w-full"
              >
                <option value="C.C.">C.C.</option>
                <option value="PPT">PPT</option>
                <option value="C.E.">C.E.</option>
                <option value="T.I.">T.I.</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Documento ID</label>
              <input
                type="text"
                required
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="input-premium w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Cargo</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input-premium w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!fullName || !documentId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}
          >
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
