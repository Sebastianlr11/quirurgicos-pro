import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function AppContent() {
  const { user } = useAuthStore();
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const fetchOperations = useOperationStore((s) => s.fetchOperations);
  const fetchRecords = useRecordStore((s) => s.fetchRecords);
  const fetchSettings = useCompanyStore((s) => s.fetchSettings);
  const { fetchCategories, initDefaults } = useCategoryStore();
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchOperations();
      fetchRecords();
      fetchSettings();
      fetchCategories().then(() => initDefaults());
    }
  }, [user]);

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
  );
}

export default App;
