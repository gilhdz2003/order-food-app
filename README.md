# Order Food Online - Sistema de Pedidos B2B

> **Sistema web de pedidos diarios de comida entre restaurante y clientes corporativos.**

Sistema completo para gestión de pedidos de comida con múltiples roles (Admin, Editor, Empleado, Comanda), autenticación OAuth y email/password, menús diarios publicables, vista en tiempo real para cocina, y sistema de reportes.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://shields.io/)

## 🚀 Stack Tecnológico

- **Next.js 16.1** (App Router + Turbopack)
- **TypeScript 5.0**
- **Tailwind CSS + shadcn/ui** (15+ componentes)
- **Supabase** (Auth, PostgreSQL, RLS, Storage)
- **Resend** (Emails transaccionales)
- **Playwright** (E2E Testing)

## 📋 Contenido

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar en Desarrollo](#ejecutar-en-desarrollo)
- [Testing](#testing)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Troubleshooting](#troubleshooting)

## ✨ Características

### Autenticación
- ✅ Google OAuth
- ✅ Email/Password
- ✅ Auto-creación de usuarios en primera sesión
- ✅ Protección de rutas por rol con middleware
- ✅ 4 roles: Admin, Editor Menú, Comanda, Empleado

### Dashboards
- ✅ **Admin**: Métricas del sistema, gestión de usuarios (CRUD)
- ✅ **Editor**: Gestión de menús y platillos, publicar/despublicar
- ✅ **Empleado**: Menú del día, carrito de pedidos, historial
- ✅ **Comanda**: Vista tiempo real de pedidos para cocina
- ✅ **Reportes**: Diario, semanal, por empresa, por empleado (CSV + PDF)

### Funcionalidades
- ✅ Menús diarios con fechas programables
- ✅ CRUD de platillos por categoría (platillo, bebida, postre)
- ✅ Control de inventario (cantidades iniciales y disponibles)
- ✅ Publicación/despublicación de menús
- ✅ **Reglas de negocio**: 1 pedido/día, máximo 5/semana, deadline 11:30 AM
- ✅ **Importación CSV** de menús con validación completa
- ✅ **Pipeline de estados**: pendiente → confirmado → en_preparación → listo → entregado
- ✅ **Impresión de etiquetas** térmicas (80mm x 50mm)
- ✅ **Reportes exportables** a CSV (Excel compatible) y PDF
- ✅ RLS (Row Level Security) en toda la BD
- ✅ Triggers para validaciones de negocio

## Requisitos Previos

- **Node.js 18+** ([descargar](https://nodejs.org/))
- **npm** (v9+) o pnpm
- **Cuenta de Supabase** ([gratis](https://supabase.com/))
- **Cuenta de Resend** ([para emails](https://resend.com/))
- **Google Cloud Project** (para OAuth, opcional)

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/your-username/order-food-app.git
cd order-food-app
```

2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

## Configuración

### 1. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com/dashboard)
2. Ir a **Settings → API**
3. Copiar las credenciales:
   - Project URL
   - **Publishable Key** (nuevo sistema: `sb_publishable_...`)
   - **Secret Key** (nuevo sistema: `sb_secret_...`)

> **Nota**: Supabase actualizó su sistema de claves. Usa las nuevas claves que comienzan con `sb_publishable_` y `sb_secret_` en lugar de `anon` y `service_role`.

### 2. Configurar Google OAuth (Opcional)

Para autenticación con Google:

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear OAuth 2.0 credentials
3. **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
4. Copiar Client ID y Client Secret
5. En Supabase: **Authentication → Providers → Google**
6. Pegar credenciales y habilitar provider

### 3. Configurar Resend (Opcional)

Para envío de emails:

1. Crear cuenta en [Resend](https://resend.com/)
2. Obtener API Key
3. Verificar dominio de envío

### 4. Configurar variables de entorno

Crear archivo `.env.local`:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
# Supabase (Nuevo sistema de claves 2026)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxx

# Resend (Email service)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3030
NEXT_PUBLIC_APP_TIMEZONE=America/Mexico_City
PORT=3030

# Environment
NODE_ENV=development
```

### 5. Ejecutar migraciones de base de datos

Ir al **SQL Editor** de Supabase y ejecutar en orden:

1. `supabase/migrations/001_initial_schema.sql` - Tablas y relaciones
2. `supabase/migrations/002_rls_policies.sql` - Políticas de seguridad
3. `supabase/migrations/003_functions_triggers.sql` - Funciones y triggers
4. `supabase/migrations/004_seed_data.sql` - Datos de prueba (opcional)

### 6. Crear usuarios de prueba en Supabase Auth

En **Authentication → Users**:

| Email | Rol | Password |
|-------|-----|----------|
| admin@demo.com | Admin | (configurar en Supabase) |
| editor@demo.com | Editor Menú | (configurar en Supabase) |
| comanda@demo.com | Comanda | (configurar en Supabase) |
| juan.perez@demo.com | Empleado | (configurar en Supabase) |

> **Nota**: Los usuarios se crearán automáticamente en la tabla `users` en su primer login (vía email/password) usando el service_role key para bypass de RLS.

## Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3030](http://localhost:3030)

## Testing

```bash
npm run test:e2e          # Ejecutar todos los tests
npm run test:e2e:ui       # UI mode con Playwright
npm run test:e2e:headed   # Con navegador visible
npm run test:e2e:debug    # Debug mode
```

## Estructura del Proyecto

```
order-food-app/
├── .github/workshots/          # CI/CD
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Layout raíz
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   │   └── supabase/          # Supabase client
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # SQL migrations
└── .env.local                 # Environment variables (gitignore)
```

## Scripts Disponibles

```bash
npm run dev              # Desarrollo en puerto 3030
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # ESLint check
npm run test:e2e         # Tests E2E completos
```

## 📊 Progreso del Proyecto

### ✅ Completado

**Sprint 0: Setup Inicial** (100%)
- ✅ Next.js 16 con App Router + Turbopack
- ✅ TypeScript + Tailwind CSS + shadcn/ui
- ✅ Supabase client con RLS completo
- ✅ Playwright configurado
- ✅ Estructura de directorios

**Sprint 1: Autenticación** (100%)
- ✅ Google OAuth
- ✅ Email/Password authentication
- ✅ Auto-creación de usuarios con service_role
- ✅ Middleware de protección por rol
- ✅ Landing page pública
- ✅ Login page con toggle OAuth/Email

**Sprint 2: Dashboards Admin + Editor** (100%)
- ✅ Dashboard Admin con métricas
- ✅ Gestión de usuarios (CRUD)
- ✅ Dashboard Editor especializado
- ✅ CRUD de menús
- ✅ CRUD de platillos
- ✅ Publicar/despublicar menús

**Sprint 3: Dashboard Empleado + Pedidos** (100%)
- ✅ Menú del día con grid de platillos
- ✅ Carrito de pedidos flotante
- ✅ Crear pedido con validación de inventario
- ✅ Reglas: 1 pedido/día, máximo 5/semana
- ✅ Historial de pedidos con exportación PDF
- ✅ Editar pedido (deadline 11:30 AM)
- ✅ Cancelar pedido con restauración de cantidades

**Sprint 4: Dashboard Comanda** (100%)
- ✅ Vista de pedidos del día agrupados por estado
- ✅ Cambiar estados con validación de transiciones
- ✅ Pipeline: pendiente → confirmado → en_preparación → listo → entregado
- ✅ Impresión de etiquetas térmicas (80mm x 50mm)
- ✅ Polling automático cada 30 segundos
- ✅ Filtros por empresa y búsqueda

**Sprint 5: Reportes & Analytics** (100%)
- ✅ Reporte diario (resumen + breakdown por empresa)
- ✅ Reporte semanal (breakdown diario + top platillos)
- ✅ Reporte por empresa (breakdown por empleado)
- ✅ Reporte por empleado (platillos favoritos)
- ✅ Exportación CSV (con BOM UTF-8 para Excel)
- ✅ Exportación PDF (vía window.print)

### ⏳ Próximos Sprints

**Sprint 6: Polish & Deploy** (En progreso - 50%)
- ⏳ Documentación final
- ⏳ CI/CD con GitHub Actions
- ⏳ Deploy a producción

**Progreso General: ~90% completado**

## 🔐 Roles y Permisos

| Rol | Dashboards | Permisos |
|-----|------------|----------|
| **admin** | Admin, Editor, Empleado, Comanda | Gestión completa del sistema |
| **editor_menu** | Editor | Gestión de menús y platillos |
| **comanda_user** | Comanda | Vista de pedidos de cocina |
| **empleado** | Empleado | Crear sus propios pedidos |

## 🐛 Troubleshooting

### Error: "infinite recursion detected in policy for relation 'users'"

**Causa**: Intentando crear usuario con cliente normal (anon key) que tiene RLS activo.

**Solución**: Asegúrate de estar usando `createAdminClient()` con service_role key para operaciones de creación de usuarios:

```typescript
const supabaseAdmin = await createAdminClient();
// Bypass RLS con service_role key
```

### Error: "Usuario no encontrado"

**Causa**: El usuario se autenticó pero no existe en la tabla `users`.

**Solución**: El sistema ahora auto-crea usuarios. Si persiste, verifica que:
1. `SUPABASE_SERVICE_ROLE_KEY` esté configurada en `.env.local`
2. La key tenga el prefijo `sb_secret_` (nuevo sistema)
3. El usuario exista en Supabase Auth primero

### Error: "searchParams is a Promise"

**Causa**: Next.js 16 cambió searchParams a Promise.

**Solución**: Usar `React.use()` para unwrap:

```typescript
const resolvedParams = use(searchParams);
```

### Login con Google no redirige

**Verificar**:
1. OAuth provider habilitado en Supabase
2. Redirect URI correcta en Google Cloud Console
3. Callback URL configurada: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## 📚 Documentación Adicional

- [Deployment Guide](./DEPLOYMENT.md) - Guía completa de deploy a Hostinger
- [Guía del Administrador](./docs/ADMIN-GUIDE.md) - Manual completo para admin
- [Guía del Empleado](./docs/EMPLOYEE-GUIDE.md) - Manual para crear pedidos
- [Guía de Comanda](./docs/COMANDA-GUIDE.md) - Manual para cocina
- [Plan Maestro](../plan_maestro.md) - Planificación completa del proyecto
- [CLAUDE.md](../CLAUDE.md) - Contexto del proyecto (Sistema KTM)

## 🤝 Contribuir

Contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

**Versión**: 1.0.0 (Sprint 5 completado - Reports & Analytics)
**Última actualización**: Febrero 24, 2026
**Estado**: Production Ready ✅ (90% completado)
