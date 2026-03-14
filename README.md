<div align="center">

# 🧵 Quirúrgicos Pro

**Sistema de nómina por producción para fábricas de confecciones quirúrgicas.**
Controla operarias, registra producción diaria, liquida automáticamente y genera reportes PDF — todo desde el navegador.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=flat-square&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## ✨ Features

- 📋 **Gestión de operaciones** — Define operaciones de confección con precio unitario en COP y categorías personalizables
- 👷 **Control de operarias** — Registro de empleadas con documento, cargo y estado activo/inactivo
- 📝 **Registro de producción** — Captura diaria de cantidades por operaria y operación, con snapshot de precios
- 💰 **Liquidación automática** — Cálculo instantáneo de nómina por producción con soporte de deducciones
- 📊 **Dashboard en tiempo real** — Estadísticas con filtros por día, semana, quincena, mes o rango personalizado
- 📄 **Reportes PDF** — Generación de colillas de pago individuales y nómina consolidada (jsPDF)
- 🏢 **Configuración de empresa** — Personaliza nombre, NIT, dirección, logo y datos de contacto
- 🔐 **Autenticación** — Login seguro con Supabase Auth y rutas protegidas
- 👥 **Multi-usuario** — Gestión de usuarios con datos aislados por cuenta
- 🌙 **Modo oscuro** — Interfaz clara u oscura según preferencia
- 🔄 **Migración automática** — Importación de datos desde localStorage a Supabase

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript 5.8 |
| **Bundler** | Vite 6 |
| **Estado** | Zustand 5 |
| **Base de datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth |
| **Estilos** | CSS personalizado con variables + modo oscuro |
| **PDF** | jsPDF + jspdf-autotable |
| **Iconos** | Lucide React |
| **Notificaciones** | React Hot Toast |
| **Routing** | React Router DOM 7 |
| **Deploy** | Netlify |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sebastianlr11/quirurgicos-pro.git
cd quirurgicos-pro

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Iniciar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
npm run preview  # Vista previa del build
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto en Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon key) del proyecto |

---

## 📁 Estructura del Proyecto

```
quirurgicos-pro/
├── components/           # Componentes React
│   ├── Auth/             # Login y rutas protegidas
│   ├── Dashboard.tsx     # Panel principal con estadísticas
│   ├── EmployeeManager.tsx
│   ├── OperationsManager.tsx
│   ├── PayrollEntry.tsx  # Registro de producción diaria
│   ├── PayrollReports.tsx
│   ├── CompanySettings.tsx
│   └── UserManagement.tsx
├── stores/               # Estado global (Zustand)
│   ├── useAuthStore.ts
│   ├── useEmployeeStore.ts
│   ├── useOperationStore.ts
│   ├── useRecordStore.ts
│   └── ...
├── services/             # Servicios externos
│   ├── supabaseClient.ts
│   ├── pdfService.ts
│   └── migrationService.ts
├── data/                 # Datos iniciales y semillas
├── types.ts              # Tipos TypeScript
└── App.tsx               # Componente raíz con routing
```

---

## 📝 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

---

<div align="center">

Hecho con ☕ y dedicación para la industria de confecciones quirúrgicas.

</div>
