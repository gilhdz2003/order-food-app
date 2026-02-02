# 🚀 Guía Rápida de Configuración
## Supabase + Google OAuth para Order Food Online

---

## 📦 PARTE 1: SUPABASE

### Paso 1: Crear Proyecto

1. **Ir a**: https://supabase.com
2. **Click**: "Start your project"
3. **Login con GitHub** (recomendado) o Google
4. **Click**: "New Project"
5. **Llenar formulario**:
   - **Organization**: "Proyectos 2026" (o la que quieras)
   - **Name**: `order-food-online`
   - **Database Password**: `Genera una segura y GUÁRDALA` 🔒
   - **Region**: `Southeast Asia (Singapore)` o la más cercana a ti
6. **Click**: "Create new project"
7. **Esperar** 2-3 minutos mientras se crea...

---

### Paso 2: Obtener Credenciales

Cuando el proyecto esté listo:

1. **Ir a**: Settings → API (en el sidebar izquierdo)
2. **Copiar estas 3 cosas**:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Pegar en** `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU_URL_AQUI.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
   SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_AQUI
   ```

---

### Paso 3: Configurar Google OAuth

1. **Ir a**: Authentication → Providers
2. **Buscar**: "Google" en la lista
3. **Click**: Enable (habilitar)
4. **NO** llenes nada todavía primero configura Google Cloud (Parte 2)

---

### Paso 4: Ejecutar Migraciones

1. **Ir a**: SQL Editor (en el sidebar)
2. **Crear nueva query** (botón "New query")
3. **Copiar y pegar** el contenido de:
   - `supabase/migrations/001_initial_schema.sql`
4. **Click**: "Run" ▶️
5. **Repetir** para:
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_seed_data.sql` (opcional, datos de prueba)

**✅ Verificar que cada uno diga "Success"**

---

### Paso 5: Crear Usuarios de Prueba (Opcional)

El seed data ya crea usuarios en la BD, pero necesitan crearse en Auth:

1. **Ir a**: Authentication → Users
2. **Click**: "Add user" → "Create new user"
3. **Crear estos usuarios**:

   | Email | Contraseña (temporal) |
   |-------|---------------------|
   | admin@demo.com | Demo123! |
   | editor@demo.com | Demo123! |
   | juan.perez@demo.com | Demo123! |

**IMPORTANTE**: Estos usuarios se crearán automáticamente cuando hagan login por primera vez con Google OAuth. El seed data ya los tiene en la tabla `users` con los roles correctos.

---

## 🔵 PARTE 2: GOOGLE CLOUD CONSOLE (OAuth)

### Paso 1: Crear Proyecto en Google Cloud

1. **Ir a**: https://console.cloud.google.com
2. **Seleccionar** o crear un proyecto (arriba a la izquierda)
3. **Nombre**: `Order Food Online`
4. **Click**: "Create"

---

### Paso 2: Habilitar Google+ API

1. **Buscar en barra superior**: "Google+ API"
2. **Click**: "Google+ API"
3. **Click**: "Enable"
4. **Esperar** unos segundos...

---

### Paso 3: Crear OAuth 2.0 Credentials

1. **Ir a**: APIs & Services → Credentials (menú izquierdo)
2. **Click**: "Create Credentials" → "OAuth client ID"
3. **Si te pide consent screen primero**:
   - **Click**: "Configure consent screen"
   - **User Type**: External
   - **Click**: "Create"
   - **Llenar**:
     - App name: `Order Food Online`
     - User support email: tu email
     - Developer contact: tu email
   - **Scroll** y click "Save and Continue" (3 veces)
4. **Ahora sí OAuth Client ID**:
   - **Application type**: Web application
   - **Name**: `Order Food Online Web Client`
   - **Authorized redirect URIs**: Agregar estas URLs:
     ```
     https://TU_PROJECT_ID.supabase.co/auth/v1/callback
     ```
     (TU_PROJECT_ID lo encuentras en la URL del proyecto Supabase)
5. **Click**: "Create"

---

### Paso 4: Copiar Client ID y Secret

Google te mostrará un popup con:

```
Client ID: 123456789-abcdefg.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxx
```

1. **Copiar Client ID**
2. **Copiar Client Secret**
3. **Ir a Supabase**: Authentication → Providers → Google
4. **Pegar en**:
   - Client ID: `TU_GOOGLE_CLIENT_ID`
   - Client Secret: `TU_GOOGLE_CLIENT_SECRET`
5. **Click**: "Save"

---

### Paso 5: Configurar Dominios en Google (IMPORTANTE)

1. **En Google Console**, tu OAuth client ID
2. **Editar** (icono de lápiz)
3. **Authorized JavaScript origins** agregar:
   ```
   http://localhost:3030
   ```
4. **Authorized redirect URIs** verificar que tenga:
   ```
   https://TU_PROJECT.supabase.co/auth/v1/callback
   ```
5. **Save**

---

## ✅ CHECKLIST FINAL

### Supabase
- [ ] Proyecto creado
- [ ] Credenciales copiadas a `.env.local`
- [ ] Google OAuth habilitado
- [ ] Client ID y Secret de Google configurados
- [ ] Migraciones 001-004 ejecutadas
- [ ] Sin errores en SQL Editor

### Google Cloud
- [ ] Proyecto creado
- [ ] Google+ API habilitada
- [ ] OAuth Client ID creado
- [ ] Redirect URI configurada (Supabase callback)
- [ ] JavaScript origin configurada (localhost:3030)

### Locales
- [ ] `.env.local` configurado con credenciales reales
- [ ] `npm install` ejecutado
- [ ] Dependencias instaladas sin errores

---

## 🧪 PROBAR CONFIGURACIÓN

### 1. Iniciar Servidor

```bash
cd order-food-app
npm run dev:3030
```

### 2. Abrir Navegador

```
http://localhost:3030
```

### 3. Hacer Login

1. **Click** "Iniciar Sesión"
2. **Click** "Continuar con Google"
3. **Seleccionar** tu cuenta de Google
4. **Debería** redirigirte al dashboard según tu rol

### 4. Verificar en Supabase

1. **Ir a**: Authentication → Users
2. **Ver** que tu usuario apareció
3. **Ir a**: Table Editor → users
4. **Ver** que tu usuario está con rol `empleado` (predeterminado)

---

## 🐛 PROBLEMAS COMUNES

### Error: "redirect_uri_mismatch"

**Solución**:
- Verifica que la URL en Google Console coincida EXACTAMENTE con la de Supabase
- Incluye el `https://` y el `/auth/v1/callback`

### Error: "Invalid Credentials"

**Solución**:
- Verifica que el Client ID y Secret sean correctos
- Copia nuevamente desde Google Console

### Error: "User not found in database"

**Solución**:
- Es NORMAL la primera vez
- El usuario se crea automáticamente en `users` table
- O créalo manualmente en `/admin/users/new`

### Error: "Project not found"

**Solución**:
- Verifica las credenciales en `.env.local`
- Asegúrate de copiar la URL completa de Supabase

---

## 📞 AYUDA RÁPIDA

**¿Dónde encuentro mi Supabase URL?**
- Dashboard → Settings → API → Project URL

**¿Dónde encuentro mi Project ID de Supabase?**
- En la URL: `https://supabase.com/dashboard/project/TU_PROJECT_ID`

**¿Dónde está el callback URL en Supabase?**
- Authentication → URL Configuration
- O usa el patrón: `https://TU_PROJECT.supabase.co/auth/v1/callback`

**¿Cómo sé que mi Google OAuth está bien?**
- En Supabase: Authentication → Providers → Google debe decir "Enabled"
- Debe tener Client ID y Secret configurados

---

**Tiempo estimado total**: 20-30 minutos

**Una vez configurado, NO necesitas hacerlo de nuevo** 🎉
