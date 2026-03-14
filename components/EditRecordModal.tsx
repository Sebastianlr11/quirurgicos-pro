import React, { useState } from 'react';
import { WorkRecord, Employee, Operation } from '../types';
import { X, Save } from 'lucide-react';

interface EditRecordModalProps {
  record: WorkRecord;
  employees: Employee[];
  operations: Operation[];
  onSave: (id: string, updates: Partial<WorkRecord>) => void;
  onClose: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record, employees, operations, onSave, onClose,
}) => {
  const [employeeId, setEmployeeId] = useState(record.employee_id);
  const [operationId, setOperationId] = useState(record.operation_id || '');
  const [quantity, setQuantity] = useState(record.quantity);
  const [date, setDate] = useState(record.date);

  const handleSave = () => {
    if (quantity <= 0) return;

    const op = operations.find((o) => o.id === operationId);
    const updates: Partial<WorkRecord> = {
      employee_id: employeeId,
      operation_id: operationId || null,
      quantity,
      date,
    };

    // Update snapshot if operation changed
    if (op && operationId !== record.operation_id) {
      updates.snapshot_operation_name = op.nombre_operacion;
      updates.snapshot_unit_price = op.valor_cop;
    }

    onSave(record.id, updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Editar Registro</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Empleado</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input-premium w-full"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Operación</label>
            <select
              value={operationId}
              onChange={(e) => setOperationId(e.target.value)}
              className="input-premium w-full"
            >
              <option value="">-- Seleccionar --</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nombre_operacion} (${op.valor_cop.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="input-premium w-full text-center font-bold text-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-premium w-full"
              />
            </div>
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
            disabled={quantity <= 0}
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
