import React, { useMemo, useState } from 'react';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useOperationStore } from '../stores/useOperationStore';
import { useRecordStore } from '../stores/useRecordStore';
import { Users, ClipboardList, Wallet, TrendingUp, Sparkles, Activity, Trophy, Award, Medal, Calendar } from 'lucide-react';

type DateFilter = 'today' | 'week' | 'month' | 'fortnight' | 'custom';

export const Dashboard: React.FC = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const operations = useOperationStore((s) => s.operations);
  const records = useRecordStore((s) => s.records);
  const loading = useRecordStore((s) => s.loading);

  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (dateFilter) {
      case 'today':
        return { start: today, end: today };
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return { start: weekStart.toISOString().split('T')[0], end: today };
      }
      case 'fortnight': {
        const day = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();
        const start = day <= 15
          ? new Date(year, month, 1)
          : new Date(year, month, 16);
        const end = day <= 15
          ? new Date(year, month, 15)
          : new Date(year, month + 1, 0);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      }
      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      }
      case 'custom':
        return { start: customStart || today, end: customEnd || today };
      default:
        return { start: today, end: today };
    }
  }, [dateFilter, customStart, customEnd]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.date >= dateRange.start && r.date <= dateRange.end);
  }, [records, dateRange]);

  const stats = useMemo(() => {
    const totalIncome = filteredRecords
      .filter((r) => r.snapshot_unit_price >= 0)
      .reduce((acc, r) => acc + r.quantity * r.snapshot_unit_price, 0);
    const totalDeductions = filteredRecords
      .filter((r) => r.snapshot_unit_price < 0)
      .reduce((acc, r) => acc + Math.abs(r.quantity * r.snapshot_unit_price), 0);
    const totalNet = totalIncome - totalDeductions;
    const totalRecords = filteredRecords.length;
    const activeEmployees = new Set(filteredRecords.map((r) => r.employee_id)).size;

    const opCounts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      opCounts[r.snapshot_operation_name] = (opCounts[r.snapshot_operation_name] || 0) + r.quantity;
    });
    const topOps = Object.entries(opCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

    const empEarnings: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      empEarnings[r.employee_id] = (empEarnings[r.employee_id] || 0) + r.quantity * r.snapshot_unit_price;
    });
    const topEmployees = Object.entries(empEarnings)
      .map(([empId, earnings]) => {
        const emp = employees.find((e) => e.id === empId);
        return { id: empId, name: emp?.full_name || 'Desconocido', earnings };
      })
      .sort((a, b) => b.earnings - a.earnings);

    return { totalIncome, totalDeductions, totalNet, totalRecords, activeEmployees, topOps, topEmployees };
  }, [filteredRecords, employees]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl" style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
      }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-white/90" size={28} />
            <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
          </div>
          <p className="text-white/90 text-lg">Bienvenido al sistema de gestión de nómina quirúrgica</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <Calendar size={18} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-500 mr-2">Periodo:</span>
        {([
          ['today', 'Hoy'],
          ['week', 'Semana'],
          ['fortnight', 'Quincena'],
          ['month', 'Mes'],
          ['custom', 'Personalizado'],
        ] as [DateFilter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setDateFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === key
                ? 'text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
            style={dateFilter === key ? { background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' } : {}}
          >
            {label}
          </button>
        ))}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input-premium text-xs py-1 px-2" />
            <span className="text-slate-400">-</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input-premium text-xs py-1 px-2" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employees */}
        <div className="stat-card animate-fade-in stagger-1 group bg-white dark:bg-slate-800" style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
              <Users className="text-blue-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Empleados</p>
              <h3 className="text-3xl font-bold text-slate-800">{employees.length}</h3>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="stat-card animate-fade-in stagger-2 group bg-white dark:bg-slate-800" style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, #14b8a6, #06b6d4)' }} />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #ccfbf1, #cffafe)' }}>
              <ClipboardList className="text-teal-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Registros</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totalRecords}</h3>
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="stat-card animate-fade-in stagger-3 group bg-white dark:bg-slate-800" style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <Wallet className="text-emerald-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Nómina Neta</p>
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                ${stats.totalNet.toLocaleString()}
              </h3>
              {stats.totalDeductions > 0 && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Descuentos: -${stats.totalDeductions.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="stat-card animate-fade-in stagger-4 group bg-white dark:bg-slate-800" style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)' }}>
              <TrendingUp className="text-orange-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Operaciones</p>
              <h3 className="text-3xl font-bold text-slate-800">{operations.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employees */}
        <div className="glass-card p-6 bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Top Empleados - Ganancias</h3>
          </div>
          <div className="space-y-4">
            {stats.topEmployees.slice(0, 5).map((emp, idx) => {
              const maxEarnings = stats.topEmployees[0]?.earnings || 1;
              const percentage = (emp.earnings / maxEarnings) * 100;
              const getMedal = (pos: number) => {
                if (pos === 0) return { icon: Trophy, bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', text: '#f59e0b' };
                if (pos === 1) return { icon: Award, bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', text: '#64748b' };
                if (pos === 2) return { icon: Medal, bg: 'linear-gradient(135deg, #fed7aa, #fdba74)', text: '#d97706' };
                return { icon: Users, bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', text: '#14b8a6' };
              };
              const medal = getMedal(idx);
              const MedalIcon = medal.icon;
              return (
                <div key={emp.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ background: medal.bg }}>
                      <MedalIcon size={18} style={{ color: medal.text }} />
                    </div>
                    <span className="text-sm text-slate-700 font-semibold truncate flex-1">{emp.name}</span>
                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                      ${emp.earnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${percentage}%`,
                      background: idx === 0 ? 'linear-gradient(90deg, #f59e0b, #f97316)' : 'linear-gradient(90deg, #14b8a6, #06b6d4)',
                    }} />
                  </div>
                </div>
              );
            })}
            {stats.topEmployees.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-400 text-sm">Sin datos suficientes aún.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Operations */}
        <div className="glass-card p-6 bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-teal-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Operaciones Más Realizadas</h3>
          </div>
          <div className="space-y-4">
            {stats.topOps.map(([name, count], idx) => (
              <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700 font-medium">{name}</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-full">{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${(count / (stats.topOps[0][1] || 1)) * 100}%`,
                    background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
                  }} />
                </div>
              </div>
            ))}
            {stats.topOps.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-400 text-sm">Sin datos suficientes aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
