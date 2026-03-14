import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore, UserRole } from '../stores/useAuthStore';
import { Shield, UserCheck, Users, UserPlus, Edit2, Save, X, Mail, Lock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const { isAdmin, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCreating(true);

    // Create user via Supabase Auth admin invite
    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (error) {
      toast.error(error.message);
      setCreating(false);
      return;
    }

    if (data.user) {
      // Set the profile with the chosen role
      await supabase
        .from('user_profiles')
        .upsert({ id: data.user.id, email: newEmail, role: newRole }, { onConflict: 'id' });

      toast.success(`Usuario ${newEmail} creado como ${newRole === 'admin' ? 'Administrador' : 'Usuario'}`);
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setShowForm(false);
      fetchUsers();
    }

    setCreating(false);
  };

  const updateRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Rol actualizado');
      setEditingId(null);
      fetchUsers();
    }
  };

  const revokeUser = async (userId: string, email: string) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes revocar tu propia cuenta');
      return;
    }
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: 'pending' })
      .eq('id', userId);

    if (error) toast.error(error.message);
    else {
      toast.success(`Acceso revocado para ${email}`);
      fetchUsers();
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-20">
        <Shield className="mx-auto text-red-300 mb-4" size={64} />
        <h2 className="text-xl font-bold text-slate-800">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const admins = users.filter((u) => u.role === 'admin');
  const activeUsers = users.filter((u) => u.role === 'user');
  const pendingUsers = users.filter((u) => u.role === 'pending');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return { bg: 'linear-gradient(135deg, #dbeafe, #c7d2fe)', color: '#4338ca', label: 'Admin' };
      case 'user': return { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46', label: 'Usuario' };
      case 'pending': return { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e', label: 'Pendiente' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Shield className="text-white" size={28} /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-white/90">Crea y administra las cuentas de acceso</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-white/80 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all shadow-lg"
            >
              <UserPlus size={18} /> Nuevo Usuario
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="stat-card animate-scale bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '2px solid rgba(99, 102, 241, 0.2)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #dbeafe, #c7d2fe)' }}>
                <UserPlus className="text-indigo-600" size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Crear Nuevo Usuario</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-premium w-full pl-10" placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-premium w-full pl-10" placeholder="Mínimo 6 caracteres" minLength={6} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Rol</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')} className="input-premium w-full">
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={creating} className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Crear Cuenta</>}
            </button>
          </form>
        </div>
      )}

      {/* Admins */}
      <div className="stat-card bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-indigo-600" size={22} />
          <h3 className="text-lg font-bold text-slate-800">Administradores ({admins.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3">{[1].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {admins.map((u) => {
              const badge = getRoleBadge(u.role);
              const isMe = u.id === currentUser?.id;
              return (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                      <Shield size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        {u.email}
                        {isMe && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">TÚ</span>}
                      </p>
                      <p className="text-xs text-slate-500">Desde {new Date(u.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="stat-card bg-white dark:bg-slate-800" style={{ borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="text-emerald-600" size={22} />
            <h3 className="text-lg font-bold text-slate-800">Usuarios Activos ({activeUsers.length})</h3>
          </div>
          <div className="space-y-3">
            {activeUsers.map((u) => {
              const badge = getRoleBadge(u.role);
              const isEditing = editingId === u.id;
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl group">
                  <div>
                    <p className="font-bold text-slate-800">{u.email}</p>
                    <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)} className="input-premium text-sm py-1 px-2">
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => updateRole(u.id, editRole)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                        <button onClick={() => { setEditingId(u.id); setEditRole(u.role); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Editar rol">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => revokeUser(u.id, u.email)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Revocar acceso">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fefce8)', borderRadius: '1.5rem', padding: '1.5rem', border: '2px solid #fbbf24' }}>
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-amber-600" size={22} />
            <h3 className="text-lg font-bold text-amber-900">Cuentas Revocadas / Pendientes ({pendingUsers.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-amber-200">
                <div>
                  <p className="font-bold text-slate-800">{u.email}</p>
                  <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString('es-CO')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateRole(u.id, 'user')} className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold shadow-md" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <UserCheck size={14} /> Activar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
