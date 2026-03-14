export interface Operation {
  id: string;
  user_id?: string;
  nombre_operacion: string;
  valor_cop: number;
  category_id?: string | null;
  is_deduction: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  full_name: string;
  document_id: string;
  document_type: string;
  position: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkRecord {
  id: string;
  user_id?: string;
  employee_id: string;
  operation_id: string | null;
  quantity: number;
  date: string;
  snapshot_operation_name: string;
  snapshot_unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface OperationCategory {
  id: string;
  user_id?: string;
  name: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string;
  address: string;
  phone: string;
  nit: string;
  email: string;
  logo_url: string;
  created_at?: string;
  updated_at?: string;
}

// Legacy types for migration from localStorage
export interface LegacyEmployee {
  id: string;
  fullName: string;
  documentId: string;
  documentType?: string;
  position?: string;
}

export interface LegacyWorkRecord {
  id: string;
  employeeId: string;
  operationId: string;
  quantity: number;
  date: string;
  timestamp: number;
  snapshotOperationName: string;
  snapshotUnitPrice: number;
}

export interface LegacyOperation {
  id: string;
  nombre_operacion: string;
  valor_cop: number;
}

export type ViewState = 'dashboard' | 'operations' | 'employees' | 'payroll' | 'reports' | 'settings';

export interface RawOperationImport {
  nombre_operacion: string;
  valor_cop: number;
}
