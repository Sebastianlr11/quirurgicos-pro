import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useCompanyStore } from '../stores/useCompanyStore';
import { useUIStore } from '../stores/useUIStore';
import {
  LayoutDashboard,
  Users,
  Scissors,
  ClipboardList,
  FileText,
  Menu,
  X,
  Sparkles,
  Building2,
  LogOut,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  currentPath: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, currentPath, onClick }) => {
  const isActive = currentPath === to || (to === '/' && currentPath === '/');
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-xl mb-2 relative overflow-hidden group ${
        isActive ? 'text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
      }`}
      style={isActive ? {
        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        boxShadow: '0 8px 16px rgba(20, 184, 166, 0.3), 0 0 20px rgba(20, 184, 166, 0.2)',
      } : {}}
    >
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}
      <Icon size={20} className={`relative z-10 ${isActive ? 'drop-shadow-sm' : ''}`} />
      <span className="relative z-10">{label}</span>
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { signOut, user, isAdmin } = useAuthStore();
  const companyName = useCompanyStore((s) => s.settings.company_name);
  const { darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useUIStore();

  const toggleMobileMenu = () => setSidebarOpen(!sidebarOpen);
  const closeMobile = () => setSidebarOpen(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Panel Principal';
      case '/produccion': return 'Registro de Producción';
      case '/reportes': return 'Nómina y PDF';
      case '/empleados': return 'Gestión de Empleados';
      case '/operaciones': return 'Lista de Precios';
      case '/configuracion': return 'Configuración';
      case '/usuarios': return 'Gestión de Usuarios';
      default: return 'Quirúrgicos Pro';
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`} style={{
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f5f3ff 100%)'
    }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 transform transition-all duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}
            >
              <Scissors className="text-white" size={20} />
              <Sparkles className="absolute top-1 right-1 text-white/50" size={10} />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
              Quirúrgicos Pro
            </span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Company name */}
        {companyName && companyName !== 'Confecciones Quirúrgicas' && (
          <div className="px-6 py-2 border-b border-white/10">
            <p className="text-xs text-slate-400 truncate font-medium">{companyName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Panel Principal" currentPath={location.pathname} onClick={closeMobile} />
          <NavItem to="/produccion" icon={ClipboardList} label="Registrar Producción" currentPath={location.pathname} onClick={closeMobile} />
          <NavItem to="/reportes" icon={FileText} label="Reportes y Nómina" currentPath={location.pathname} onClick={closeMobile} />

          {/* Section Divider */}
          <div className="pt-6 pb-3 px-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuración</p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent" />
            </div>
          </div>

          <NavItem to="/empleados" icon={Users} label="Empleados" currentPath={location.pathname} onClick={closeMobile} />
          <NavItem to="/operaciones" icon={Scissors} label="Precios / Operaciones" currentPath={location.pathname} onClick={closeMobile} />
          <NavItem to="/configuracion" icon={Building2} label="Empresa" currentPath={location.pathname} onClick={closeMobile} />
          {isAdmin() && (
            <NavItem to="/usuarios" icon={Shield} label="Usuarios" currentPath={location.pathname} onClick={closeMobile} />
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {/* User info card */}
          <div className="p-3 rounded-xl border" style={{
            background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(20, 184, 166, 0.2)',
          }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
                background: isAdmin() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #14b8a6, #06b6d4)',
              }}>
                {isAdmin() ? <Shield size={14} className="text-white" /> : <Users size={14} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{
                  color: isAdmin() ? '#6366f1' : '#14b8a6',
                }}>
                  {isAdmin() ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header
          className="lg:hidden h-16 flex items-center px-4 justify-between shrink-0 shadow-md"
          style={{
            background: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {getPageTitle()}
          </span>
          <button
            onClick={toggleMobileMenu}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
