# Guía de Comanda - OrderFood Online

> Guía para el equipo de cocina que gestiona pedidos

---

## 🎯 Tu Rol

Como **Usuario de Comanda** (Cocina), tú:

- ✅ Ves todos los pedidos del día
- ✅ Cambias estados de pedidos
- ✅ Imprimes etiquetas térmicas
- ✅ Filtras por empresa y estado
- ✅ Actualizas en tiempo real (cada 30 segundos)

---

## 📋 Índice

1. [Dashboard de Comanda](#dashboard-de-comanda)
2. [Estados de Pedidos](#estados-de-pedidos)
3. [Cambiar Estados](#cambiar-estados)
4. [Imprimir Etiquetas](#imprimir-etiquetas)
5. [Filtros y Búsqueda](#filtros-y-búsqueda)

---

## 🖥️ Dashboard de Comanda

### Acceder a Comanda

1. Haci login, serás redirigido automáticamente a **Comanda**
2. Si no, click en **"Comanda"** en el sidebar

### Layout del Dashboard

El dashboard está dividido en **5 columnas** por estado:

1. **Pendientes** - Pedidos recién creados
2. **Confirmados** - Pedidos confirmados por admin
3. **En Preparación** - Pedidos que estás cocinando
4. **Listos** - Pedidos terminados, esperando entrega
5. **Entregados** - Pedidos entregados

### Actualización Automática

El dashboard **se actualiza cada 30 segundos** automáticamente.

También puedes:
- Click en el botón **"Actualizar"** para actualización manual
- Ver **"Última actualización: hace X segundos"**

---

## 📊 Estados de Pedidos

### Pipeline de Estados

```
Pendiente → Confirmado → En Preparación → Listo → Entregado
            ↓
         Cancelado
```

### Descripción de Estados

| Estado | Descripción | Acción |
|--------|-------------|--------|
| **Pendiente** | Recién creado por empleado | Confirmar |
| **Confirmado** | Confirmado por admin | Iniciar preparación |
| **En Preparación** | Cocinando actualmente | Marcar listo cuando termine |
| **Listo** | Terminado, listo para entregar | Marcar como entregado |
| **Entregado** | Entregado al empleado | (Estado final) |
| **Cancelado** | Cancelado por empleado o cocina | (Estado final) |

---

## 🔄 Cambiar Estados

### Confirmar Pedido

1. En columna **"Pendientes"**, busca el pedido
2. Click en botón **"Confirmar"**
3. El pedido se mueve a **"Confirmados"**

### Iniciar Preparación

1. En columna **"Confirmados"**, busca el pedido
2. Click en botón **"Iniciar Preparación"**
3. El pedido se mueve a **"En Preparación"**

### Marcar como Listo

1. En columna **"En Preparación"**, busca el pedido
2. Click en botón **"Marcar Listo"**
3. El pedido se mueve a **"Listos"**

### Marcar como Entregado

1. En columna **"Listos"**, busca el pedido
2. Click en botón **"Marcar Entregado"**
3. El pedido se mueve a **"Entregados"**

### Cancelar Pedido

1. Solo puedes cancelar desde **"Pendientes"** o **"Confirmados"**
2. Click en botón **"Cancelar"**
3. Confirma la cancelación
4. Las cantidades se restauran al menú

**Nota**: Ya no puedes cancelar desde "En Preparación" en adelante.

---

## 🏷️ Imprimir Etiquetas

### Formato de Etiqueta

- **Tamaño**: 80mm x 50mm (impresora térmica)
- **Contenido**:
  - Logo del restaurante
  - Código de pedido
  - Empleado
  - Empresa
  - Items con cantidades
  - Fecha/hora

### Imprimir Etiqueta

1. En cualquier pedido, click en botón **"Imprimir Etiqueta"**
2. Se abre ventana de impresión
3. Selecciona impresora térmica
4. Click **"Imprimir"**

### Configurar Impresora (Primera vez)

1. Ve a **Configuración de Impresora** en tu sistema
2. Asegúrate de que el tamaño de papel sea **80mm x 50mm** o **3" x 2"**
3. Configura márgenes en **0**
4. Guarda configuración

---

## 🔍 Filtros y Búsqueda

### Filtrar por Empresa

1. Use el dropdown **"Filtrar por Empresa"**
2. Selecciona la empresa deseada
3. Solo verás pedidos de esa empresa

### Filtrar por Estado

1. Los pedidos ya están agrupados por estado
2. Cada columna es un filtro

### Buscar Pedido

1. Usa el campo de **"Buscar"**
2. Escribe:
   - Código de pedido
   - Nombre de empleado
   - Nombre de empresa
3. Resultados se filtran en tiempo real

---

## 📱 Tarjeta de Pedido

Cada pedido muestra:

### Encabezado
- **Código**: ABC12345
- **Hora**: 11:23 AM
- **Empleado**: Juan Pérez
- **Empresa**: Empresa X

### Items
- **2x** Tacos de Carnitas
- **1x** Agua de Horchata
- **1x** Gelatina de Fresa

### Total
- **Total: $145.00**

### Acciones
- Botones según estado actual
- Imprimir etiqueta
- Ver detalles

---

## ⚠️ Reglas Importantes

### Regla 1: Transiciones en Orden

Debes seguir el orden del pipeline. No puedes saltar estados:
- ❌ Pendiente → Listo (no válido)
- ✅ Pendiente → Confirmado → En Preparación → Listo (válido)

### Regla 2: No Retroceder

No puedes regresar a un estado anterior:
- ❌ Listo → En Preparación (no válido)
- ✅ Listo → Entregado (válido)

### Regla 3: Cancelación Solo al Inicio

Solo puedes cancelar desde **"Pendientes"** o **"Confirmados"**.
Desde **"En Preparación"** en adelante, no se puede cancelar.

### Regla 4: Confirmar Antes de Cocinar

Siempre confirma un pedido antes de iniciar preparación.
Esto asegura que el pedido es válido y que hay inventario.

---

## 💡 Tips

### Tip 1: Actualización Manual

Si acabas de terminar un pedido, click en **"Actualizar"** para ver cambios de inmediato.

### Tip 2: Usar Etiquetas

Imprime etiquetas para organizar pedidos por orden de llegada o por empresa.

### Tip 3: Ver Detalles Completos

Click en cualquier pedido para ver detalles completos:
- Todos los items con cantidades
- Notas especiales
- Fecha y hora exacta

### Tip 4: Filtrar por Empresa

Si hay muchos pedidos, filtra por empresa para enfocarte en una sola.

---

## 🐛 Problemas Comunes

### "El dashboard no se actualiza"

**Solución**:
- Click en botón **"Actualizar"**
- Espera 30 segundos para actualización automática
- Verifica tu conexión a internet

### "No puedo ver pedidos nuevos"

**Causa**: El empleado acaba de hacer el pedido

**Solución**:
- Click en **"Actualizar"**
- Espera 30 segundos para actualización automática

### "No puedo cambiar el estado"

**Causa**: Transición no válida o ya estás en estado final

**Solución**:
- Verifica que sigues el orden del pipeline
- Verifica que el pedido no esté ya "Entregado"

---

## 📞 Soporte

Si tienes problemas:

1. **Contacta al admin del sistema**
2. **Envía email a soporte**: soporte@tudominio.com
3. **Llama al soporte técnico**: [número]

---

## 🎉 Buen Trabajo

Gracias por mantener el flujo de pedidos organizado.
¡Tu trabajo es crucial para la operación!

---

**Fin de la Guía de Comanda**
