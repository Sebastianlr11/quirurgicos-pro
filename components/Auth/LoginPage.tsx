import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Scissors, Sparkles, Mail, Lock, LogIn, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'login' | 'forgot';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signIn, resetPassword } = useAuthStore();

  const [mode, setMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile && profile.role !== 'pending') {
      navigate('/', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Bienvenido!');
      navigate('/', { replace: true });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Se envió un enlace de recuperación a tu correo.', { duration: 5000 });
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 30%, #f5f3ff 60%, #fdf2f8 100%)'
    }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-xl mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
            <Scissors className="text-white" size={36} />
            <Sparkles className="absolute top-2 right-2 text-white/50" size={14} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
            Quirúrgicos Pro
          </h1>
          <p className="text-slate-500 mt-2">Sistema de Nómina por Producción</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">

          {/* === LOGIN === */}
          {mode === 'login' && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium w-full pl-12" placeholder="correo@ejemplo.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium w-full pl-12" placeholder="Tu contraseña" minLength={6} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 px-6 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={20} /> Entrar</>}
                </button>
              </form>
              <div className="mt-5 text-center">
                <button onClick={() => setMode('forgot')} className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          )}

          {/* === FORGOT PASSWORD === */}
          {mode === 'forgot' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('login')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ArrowLeft size={20} className="text-slate-500" />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Recuperar Contraseña</h2>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium w-full pl-12" placeholder="correo@ejemplo.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 px-6 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}>
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={20} /> Enviar Enlace</>}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          Quirúrgicos Pro v3.0 &bull; Sistema Premium de Nómina
        </p>
      </div>
    </div>
  );
};
