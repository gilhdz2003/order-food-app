# Guía de Administrador - OrderFood Online

> Guía completa para administradores del sistema de pedidos

---

## 🎯 Rol del Administrador

Como **Admin**, tienes control total del sistema:

- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de empresas
- ✅ Gestión de menús y platillos
- ✅ Reportes y analytics
- ✅ Configuración del sistema

---

## 📋 Índice

1. [Dashboard Principal](#dashboard-principal)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Gestión de Empresas](#gestión-de-empresas)
4. [Gestión de Menús](#gestión-de-menús)
5. [Reportes](#reportes)

---

## 🖥️ Dashboard Principal

Al hacer login como admin, verás el **Overview** con:

### KPIs del Día
- **Pedidos Hoy**: Total de pedidos creados hoy
- **Pedidos Pendientes**: Pedidos sin confirmar
- **Importe Total**: Suma de todos los pedidos del día
- **Ticket Promedio**: Promedio de importe por pedido

### Acciones Rápidas
- **Crear Usuario**: Agregar nuevo empleado/cliente
- **Nuevo Menú**: Iniciar creación de menú diario
- **Ver Pedidos**: Acceder a lista completa de pedidos

---

## 👥 Gestión de Usuarios

### Ver Lista de Usuarios

1. Navega a **Admin → Usuarios**
2. Verás tabla con todos los usuarios:
   - Nombre completo
   - Email
   - Empresa asignada
   - Rol
   - Estado (Activo/Inactivo)

### Crear Usuario Manual

1. Click en **"Nuevo Usuario"**
2. Llena el formulario:
   - **Email**: (único, requerido)
   - **Nombre completo**: (requerido)
   - **Teléfono**: (opcional)
   - **Rol**: Selecciona del dropdown
   - **Empresa**: Selecciona empresa existente o crea nueva
   - **Estado**: Activo/Inactivo
3. Click **"Guardar"**

El usuario recibirá un email para establecer su contraseña.

### Editar Usuario

1. En la tabla de usuarios, click en el usuario
2. Modifica los campos necesarios
3. Click **"Guardar cambios"**

### Cambiar Rol

1. Editar usuario
2. Cambiar el rol del dropdown:
   - `admin` - Acceso total
   - `editor_menu` - Solo menús
   - `comanda_user` - Solo cocina
   - `empleado` - Solo crear pedidos
3. Guardar cambios

### Suspender/Reactivar Usuario

1. Editar usuario
2. Toggle **"Estado Activo"**
3. Guardar

**Nota**: Usuarios inactivos no pueden hacer login.

---

## 🏢 Gestión de Empresas

### Crear Empresa

1. Navega a **Admin → Empresas**
2. Click en **"Nueva Empresa"**
3. Llena el formulario:
   - **Nombre**: (único, requerido)
   - **Estado**: Activo/Inactivo
4. Click **"Guardar"**

### Ver Usuarios por Empresa

En la lista de usuarios, puedes filtrar por empresa para ver:
- Cuántos usuarios tiene cada empresa
- Qué rol tiene cada usuario

---

## 🍽️ Gestión de Menús

### Ver Lista de Menús

1. Navega a **Admin → Menús**
2. Verás tabla con menús:
   - Fecha
   - Estado (Publicado/Borrador)
   - Cantidad de platillos
   - Fecha de publicación

### Crear Nuevo Menú

1. Click en **"Nuevo Menú"** o **Admin → Menús → Nuevo**
2. Selecciona la **fecha del menú**
3. Click **"Crear"**

### Agregar Platillos

Hay 2 formas:

#### Opción 1: Manual (Uno por uno)
1. En el editor de menú, click **"Agregar Platillo"**
2. Llena el formulario:
   - **Nombre**: (requerido)
   - **Descripción**: (opcional)
   - **Categoría**: Platillo, Bebida, Postre
   - **Precio**: (requerido, formato: 85.00)
   - **Cantidad Inicial**: (requerido)
   - **Imagen**: Upload o arrastrar archivo
3. Click **"Guardar"**

#### Opción 2: Importación CSV (Recomendado)

1. Click en **"Importar CSV"**
2. Descarga el template
3. Llena el CSV con este formato:

```csv
categoria,nombre,descripcion,precio,cantidad,nombre_imagen
platillo,Tacos de Carnitas,Tres tacos con limón,85.00,15,tacos.jpg
bebida,Agua de Horchata,Agua fresca,25.00,30,horchata.jpg
postre,Gelatina,Fresa con crema,35.00,20,gelatina.jpg
```

4. Arrastra el CSV o click para seleccionar
5. Verifica el preview
6. Click **"Importar"**

### Publicar Menú

1. En la lista de menús, click en el menú
2. Click en **"Publicar Menú"**
3. Los empleados podrán ver el menú

### Despublicar Menú

1. En la lista de menús, click en el menú
2. Click en **"Despublicar"**
3. Los empleados ya no verán el menú

---

## 📊 Reportes

### Tipos de Reporte Disponibles

| Tipo | Descripción | Uso Recomendado |
|------|-------------|-----------------|
| **Diario** | Resumen del día con breakdown por empresa | Cierre de caja diario |
| **Semanal** | Breakdown diario, top platillos, resumen por empresa | Facturación semanal |
| **Por Empresa** | Reporte de una empresa con breakdown por empleado | Reporte a cliente |
| **Por Empleado** | Reporte personal con platillos favoritos | Control personal |

### Generar Reporte

1. Navega a **Admin → Reportes**
2. Selecciona el **tipo de reporte**
3. Selecciona el **período**:
   - Hoy
   - Esta semana
   - Este mes
   - Personalizado (selecciona fechas)
4. Si es por empresa/empleado, selecciónalo del dropdown
5. Click **"Generar Reporte"**

### Ver Resultados

El reporte muestra:
- **Tarjetas de Resumen**: KPIs principales
- **Tabla de Detalle**: Lista de todos los pedidos
- **Exportación**: CSV o PDF

### Exportar Reporte

**CSV** (Excel compatible):
- Click **"Exportar"** → **"Exportar CSV"**
- El archivo se descarga automáticamente
- Abre directamente en Excel

**PDF**:
- Click **"Exportar"** → **"Exportar PDF"**
- Se abre nueva ventana con vista de impresión
- Click **"Imprimir"** o **"Guardar como PDF"**

---

## ⚙️ Configuración del Sistema

### Configuración Actual

La configuración del sistema está en **Admin → Configuración**:

| Configuración | Valor Actual |
|----------------|--------------|
| Deadline de pedidos | 11:30 AM |
| Día de corte semanal | Lunes |
| Notificaciones | Activadas |

### Cambiar Configuración

1. Navega a **Admin → Configuración**
2. Modifica los valores
3. Click **"Guardar"**

**Nota**: Los cambios afectan inmediatamente a todos los usuarios.

---

## 🔐 Seguridad

### Buenas Prácticas

- ✅ **Usar contraseñas fuertes** para admin
- ✅ **No compartir credenciales** de admin
- ✅ **Suspender usuarios** que ya no trabajen
- ✅ **Revisar reportes** semanalmente

### Auditoría

El sistema mantiene un **log de actividad** de:
- Cambios de estado de pedidos
- Cambios de roles
- Creación/edición de usuarios
- Publicación de menús

Para ver el log, contacta al desarrollador del sistema.

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa esta guía**
2. **Contacta al soporte técnico**
3. **Revisa los logs de error** en el dashboard

---

**Fin de la Guía de Administrador**
