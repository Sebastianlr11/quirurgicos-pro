import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import { useEmployeeStore } from './stores/useEmployeeStore';
import { useOperationStore } from './stores/useOperationStore';
import { useRecordStore } from './stores/useRecordStore';
import { useCompanyStore } from './stores/useCompanyStore';
import { useCategoryStore } from './stores/useCategoryStore';
import { useUIStore } from './stores/useUIStore';
import { LoginPage } from './components/Auth/LoginPage';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OperationsManager } from './components/OperationsManager';
import { EmployeeManager } from './components/EmployeeManager';
import { PayrollEntry } from './components/PayrollEntry';
import { PayrollReports } from './components/PayrollReports';
import { CompanySettings } from './components/CompanySettings';
import { UserManagement } from './components/UserManagement';
import { ToastProvider } from './components/Toast';
import { MigrationBanner } from './components/MigrationBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Formatea una fecha usando componentes LOCALES (evita el corrimiento de día
// por UTC que hacía que registros de la noche cayeran en el día/mes siguiente).
function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return { start, end };
}

function AppContent() {
  // Usar user?.id (string primitivo) en lugar del objeto user completo.
  // Así el useEffect solo se dispara cuando el usuario realmente cambia
  // (login / logout), no en cada refresco de token donde Supabase crea
  // un nuevo objeto User con el mismo ID.
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const fetchOperations = useOperationStore((s) => s.fetchOperations);
  const fetchRecords = useRecordStore((s) => s.fetchRecords);
  const fetchSettings = useCompanyStore((s) => s.fetchSettings);
  const { fetchCategories, initDefaults } = useCategoryStore();
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    if (userId) {
      const { start, end } = getCurrentMonthRange();

      fetchEmployees().then(({ error }) => {
        if (error) toast.error(`Error cargando empleados: ${error}`);
      });

      fetchOperations().then(({ error }) => {
        if (error) toast.error(`Error cargando operaciones: ${error}`);
      });

      fetchRecords(start, end).then(({ error }) => {
        if (error) toast.error(`Error cargando registros: ${error}`);
      });

      fetchSettings();
      fetchCategories().then(() => initDefaults());
    }
  }, [userId]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <Layout>
      <MigrationBanner />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produccion" element={<PayrollEntry />} />
        <Route path="/reportes" element={<PayrollReports />} />
        <Route path="/empleados" element={<EmployeeManager />} />
        <Route path="/operaciones" element={<OperationsManager />} />
        <Route path="/configuracion" element={<CompanySettings />} />
        <Route path="/usuarios" element={<UserManagement />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f5f3ff 100%)'
      }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Cargando Quirúrgicos Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
