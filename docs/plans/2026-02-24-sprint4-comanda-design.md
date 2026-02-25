# Sprint 4 Design: Comanda Dashboard (Kitchen View)

**Date**: 2026-02-24
**Status**: Approved
**Scope**: MVP with polling (no real-time)

---

## Overview

Implement the kitchen view for managing orders: view, change status, print labels, mark as delivered.

---

## Section 1: Architecture & Structure

### Routes

```
/comanda                    → Dashboard principal (pedidos del día)
/comanda/[id]               → Detalle de pedido individual
```

### Components

- `OrderGroupCard` - Groups orders by status (pendientes, en preparación, listos)
- `OrderSummaryCard` - Order summary (code, employee, items, total)
- `StatusActions` - Status change buttons
- `PrintLabelButton` - Print thermal label (80mm x 50mm)
- `OrderFilterBar` - Filters by company, status, search
- `RefreshIndicator` - Shows last update time, manual refresh button

### Polling Strategy

- `useInterval` hook for 30-second refresh
- Manual "Refresh" button
- No Realtime Subscriptions (simpler for MVP)

### Data Required

- Orders created today (`created_at >= today`)
- With items, dishes, users, companies
- Ordered by status, then created_at ASC

---

## Section 2: Data Flow & Status

### Fetch Orders (Server Action)

```typescript
getComandaOrders(today: string) → OrderWithItems[]
- WHERE created_at >= today
- JOIN items, dishes, users, companies
- ORDER BY status ASC, created_at ASC
```

### Status Pipeline

```
pendiente → confirmado → en_preparacion → listo → entregado
```

### Transition Rules

- Only forward transitions (no going back)
- Comanda can: pendiente → confirmado → en_preparacion → listo → entregado
- Only Admin can cancel (status: cancelado)

### Valid Transitions

| Current | Next States |
|---------|-------------|
| pendiente | confirmado, cancelado |
| confirmado | en_preparación |
| en_preparacion | listo |
| listo | entregado |
| entregado | (none - read only) |

### Polling Implementation

```typescript
const { data: orders, lastUpdate, refresh, isLoading } = useComandaPolling({
  interval: 30000, // 30 seconds
  onError: (error) => toast.error('Error al cargar pedidos')
})
```

### Filters

- By status (tabs: Todos, Pendientes, En Preparación, Listos)
- By company (dropdown)
- Search by order code or employee name

---

## Section 3: UI/UX Components

### OrderGroupCard

- 4 visual sections: Pendientes, En Preparación, Listos, Entregados
- Each section shows order count badge
- Different background colors per state
- No drag & drop (MVP)

### OrderSummaryCard

**Header**:
- order_code (large, prominent)
- employee name
- company name
- time elapsed badge ("Hace 5 min")

**Items List**:
- dish name with quantity
- compact format

**Action Buttons**:
- Based on current state (see StatusActions below)

### StatusActions

| Current State | Available Buttons |
|---------------|------------------|
| pendiente | Confirmar, Cancelar |
| confirmado | Iniciar Preparación |
| en_preparacion | Marcar Listo |
| listo | Marcar Entregado |
| entregado | (none - read only) |

### PrintLabelButton

- Opens dialog with label preview
- Format for thermal printer 80mm x 50mm
- Content: code, name, items, time
- "Imprimir" button uses `window.print()` with CSS `@media print`

### RefreshIndicator

- Top bar: "Actualizado: Hace 2 min"
- Manual refresh button
- Spinner while loading
- Auto-refresh every 30s in background

### Status Colors

```typescript
const statusColors = {
  pendiente: 'bg-yellow-500',
  confirmado: 'bg-blue-500',
  en_preparacion: 'bg-orange-500',
  listo: 'bg-green-500',
  entregado: 'bg-green-700',
  cancelado: 'bg-red-500',
}
```

---

## Section 4: Error Handling & Functions

### Server Actions (actions.ts)

```typescript
// Get today's orders for Comanda
getComandaOrders(today: string) → OrderWithItems[]

// Update order status
updateOrderStatus(orderId: string, newStatus: OrderStatus) → { success, error }
- Validates valid transition (no skipping states)
- Updates updated_at
- If status = 'entregado', sets delivered_at

// Mark as delivered
markOrderDelivered(orderId: string) → { success, error }
- Only from 'listo' status
- Updates status → 'entregado'
- Sets delivered_at = now()

// Cancel order (Admin only)
cancelOrderFromComanda(orderId: string) → { success, error }
- Only from 'pendiente' or 'confirmado'
- Updates status → 'cancelado'
- Restores inventory
```

### Polling Hook (hooks/useComandaPolling.ts)

```typescript
const useComandaPolling = (interval: number = 30000) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      const data = await getComandaOrders(today)
      setOrders(data)
      setLastUpdate(new Date())
      setIsLoading(false)
    }

    fetch() // initial fetch
    const timer = setInterval(fetch, interval)
    return () => clearInterval(timer)
  }, [interval])

  return { orders, lastUpdate, isLoading, refresh: fetch }
}
```

### Special Cases Handled

- No orders today → Empty state with message "No hay pedidos para hoy"
- Loading error → Toast + retry button
- Invalid transition → Error "No puedes cambiar de X a Y directamente"
- Already delivered → Buttons disabled, badge "Completado"

### Print CSS (app/comanda/print-label.css)

```css
@media print {
  body * { visibility: hidden; }
  #label-preview, #label-preview * { visibility: visible; }
  #label-preview {
    position: fixed;
    top: 0; left: 0;
    width: 80mm; height: 50mm;
    padding: 5mm;
    border: 2px solid black;
    font-size: 12pt;
  }
}
```

---

## Implementation Order

1. Server Actions in `actions.ts`
2. Polling hook in `hooks/useComandaPolling.ts`
3. Components: OrderGroupCard, OrderSummaryCard, StatusActions, PrintLabelButton
4. Page: `/comanda/page.tsx`
5. Layout update for comanda_user role
6. Print CSS

---

**Designed by**: Claude (Kimi)
**Approved by**: Gil Hernandez
**Date**: 2026-02-24
