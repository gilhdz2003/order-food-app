# Deployment Guide - OrderFood Online

> Guía completa para deploy del sistema a Hostinger (Business Hosting)

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Deploy a Hostinger](#deploy-a-hostinger)
4. [Post-Deploy](#post-deploy)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos Previos

Antes de empezar, asegúrate de tener:

- ✅ Cuenta en [Hostinger](https://hostinger.com) con plan Business o superior
- ✅ Cuenta en [GitHub](https://github.com) con el repositorio del proyecto
- ✅ Proyecto de Supabase creado y configurado
- ✅ Dominio configurado (opcional, puedes usar el dominio gratuito de Hostinger)

---

## 🔧 Configuración de Supabase

### 1. Verificar Migraciones

Asegúrate de que todas las migraciones estén ejecutadas en Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. **SQL Editor** → Verifica que las siguientes migraciones estén ejecutadas:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_seed_data.sql` (opcional - solo para desarrollo)

### 2. Configurar URLs de Producción

En Supabase, configura las URLs permitidas:

1. **Authentication → URL Configuration**
2. Agrega tu dominio de producción:
   ```
   https://tudominio.com/*
   https://www.tudominio.com/*
   ```

### 3. Obtener Credenciales Finales

1. **Settings → API**
2. Copia las siguientes credenciales:
   - **Project URL**
   - **Publishable Key** (comienza con `sb_publishable_`)
   - **Secret Key** (comienza con `sb_secret_`)

---

## 🚀 Deploy a Hostinger

### Paso 1: Preparar el Repositorio

```bash
# Asegurarte de estar en la rama correcta
git checkout main

# Hacer pull de los últimos cambios
git pull origin main

# Verificar que el build funciona localmente
npm run build
```

### Paso 2: Configurar GitHub Actions (Opcional)

Crea el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload to Hostinger
        # Agregar script de upload aquí
        run: echo "Deploy script aquí"
```

### Paso 3: Conectar Repositorio en Hostinger

1. **Log in a Hostinger**
   - Ve a [hPanel](https://hpanel.hostinger.com)
   - Hosting → Manage → GitHub Deployment

2. **Conectar Repositorio**
   - Click en "Connect or Create Repository"
   - Autoriza Hostinger en tu cuenta de GitHub
   - Selecciona el repositorio `order-food-app`
   - Selecciona la rama `main`

3. **Configurar Build Settings**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
   - **Node Version**: `18.x`

### Paso 4: Configurar Variables de Entorno

En Hostinger, agrega las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://tudominio.com
NEXT_PUBLIC_APP_TIMEZONE=America/Mexico_City
NODE_ENV=production
```

### Paso 5: Ejecutar Deploy

1. Click en **"Deploy Now"** en Hostinger
2. Espera a que se complete el build y deploy
3. Verifica que el status sea **"Active"**

---

## ✅ Post-Deploy

### Verificación Inmediata

1. **Abrir el sitio**
   ```
   https://tudominio.com
   ```

2. **Test de Login**
   - Intenta login con Google OAuth
   - Verifica redirección correcta

3. **Test de Creación de Pedido**
   - Login como empleado
   - Navega a Menú del Día
   - Intenta crear un pedido

### Monitoreo

Hostinger incluye métricas básicas:
- **Uptime**: Hosting → Uptime Monitoring
- **Logs**: Hosting → Logs → Error Logs
- **Resources**: Hosting → Resources (CPU, RAM)

---

## 🔄 Deploy Automático

Hostinger hace deploy automático cuando haces push a la rama configurada:

```bash
# Hacer cambios
git add .
git commit -m "Fix: actualización de reportes"
git push origin main

# Deploy automático en Hostinger 🚀
```

### Verificar Deploy

En Hostinger:
1. GitHub Deployment → Ver "Latest Deployment"
2. Status debe ser "Active" con timestamp reciente

---

## 🐛 Troubleshooting

### Error: "Failed to build"

**Causa**: Error en el build de Next.js

**Solución**:
1. Verifica que el build funcione localmente: `npm run build`
2. Revisa los logs en Hostinger → Logs → Build Logs
3. Verifica que todas las variables de entorno estén configuradas

---

### Error: "Database connection failed"

**Causa**: Supabase no permite conexiones desde el dominio

**Solución**:
1. En Supabase → Authentication → URL Configuration
2. Agrega tu dominio de producción
3. Espera unos minutos a que se propague

---

### Error: "OAuth redirect not working"

**Causa**: Callback URL incorrecta

**Solución**:
1. En Google Cloud Console, agrega la callback URL de producción:
   ```
   https://tudominio.com/auth/callback
   ```
2. En Supabase → Authentication → Providers → Google
3. Verifica que la callback URL esté configurada correctamente

---

### Error: "404 on static files"

**Causa**: Archivos estáticos no se sirven correctamente

**Solución**:
1. Verifica que `next.config.js` tenga configurado `output: 'standalone'`
2. Re-deploy el proyecto

---

## 📊 Checklist de Deploy

### Pre-Deploy
- [ ] Build local exitoso
- [ ] Migraciones de Supabase ejecutadas
- [ ] Variables de entorno preparadas
- [ ] Dominio configurado (o usando subdominio de Hostinger)

### Deploy
- [ ] Repositorio conectado en Hostinger
- [ ] Build command configurado
- [ ] Variables de entorno agregadas
- [ ] Deploy ejecutado exitosamente

### Post-Deploy
- [ ] Sitio accesible en HTTPS
- [ ] Login funcional
- [ ] Test de creación de pedido exitoso
- [ ] Reportes generando correctamente
- [ ] Uptime monitoring configurado

---

## 🚀 Pro Tips

### 1. Deploy Staging vs Production

Usa ramas separadas:
- `main` → Producción
- `staging` → Staging

En Hostinger, crea dos deployments separados.

### 2. Rollback Rápido

Si algo sale mal:
```bash
# Revertir último commit
git revert HEAD

# Push para deploy automático
git push origin main
```

### 3. Mantenimiento

**Actualización semanal**:
- Actualizar dependencias: `npm update`
- Verificar logs de errores
- Probar funcionalidades críticas

---

## 📞 Soporte

Si tienes problemas durante el deploy:

1. **Revisar logs**: Hostinger → Logs
2. **Revisar docs**: [Hostinger GitHub Deploy Docs](https://support.hostinger.com/en/articles/0016516921-how-to-deploy-from-github)
3. **Verificar Supabase**: Logs en Dashboard

---

**Fin de la Guía de Deploy**

Para más información, revisa el [README.md](./README.md) principal.
