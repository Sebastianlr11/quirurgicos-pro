import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Captura errores de render en cualquier componente hijo y muestra una
// pantalla amigable con opción de recargar, en vez de dejar la app en blanco.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log para depuración (visible en la consola del navegador)
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f5f3ff 100%)' }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Algo salió mal</h1>
            <p className="text-slate-500 mb-6">
              Ocurrió un error inesperado. Tus datos guardados están a salvo. Recarga la página para continuar.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
