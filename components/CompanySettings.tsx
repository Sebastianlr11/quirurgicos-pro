import React, { useState, useEffect } from 'react';
import { useCompanyStore } from '../stores/useCompanyStore';
import { Building2, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanySettings: React.FC = () => {
  const { settings, loading, loaded, fetchSettings, updateSettings } = useCompanyStore();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded) fetchSettings();
  }, [loaded]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateSettings({
      company_name: form.company_name,
      address: form.address,
      phone: form.phone,
      nit: form.nit,
      email: form.email,
      logo_url: form.logo_url,
    });
    if (error) toast.error(error);
    else toast.success('Configuración guardada');
    setSaving(false);
  };

  if (loading && !loaded) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
      }}>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Building2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración de Empresa</h1>
            <p className="text-white/90">Personaliza la información de tu empresa</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      {/* Form */}
      <div className="stat-card group bg-white dark:bg-slate-800" style={{
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Nombre de la Empresa</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="input-premium w-full"
                placeholder="Confecciones Quirúrgicas S.A.S"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">NIT</label>
              <input
                type="text"
                value={form.nit}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                className="input-premium w-full"
                placeholder="900.123.456-7"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-premium w-full"
              placeholder="Calle 123 #45-67, Bogotá"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Teléfono</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-premium w-full"
                placeholder="(601) 123-4567"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Correo Electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-premium w-full"
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={20} /> Guardar Configuración</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
