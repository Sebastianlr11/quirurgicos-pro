import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#1e293b',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
      success: {
        iconTheme: {
          primary: '#14b8a6',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
);
