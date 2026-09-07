# Sprint 3 Design: Employee Dashboard + Order System

**Date**: 2026-02-24
**Status**: Approved
**Scope**: MVP Complete (full functionality from day 1)

---

## Overview

Implement the complete employee order flow: view menu → select items → place order → edit order (before 11:30 AM) → view history.

---

## Section 1: Architecture & Structure

### Routes

```
/employee                    → Dashboard (summary, today's menu highlighted)
/employee/menu               → Today's menu with dish grid
/employee/cart               → Order cart (summary before confirming)
/employee/orders             → Order history
/employee/orders/[id]        → Specific order detail
```

### Components

- `DishCard` - Individual dish card with image, name, price, availability badge
- `MenuGrid` - Responsive grid with category tabs (platillo/bebida/postre)
- `CartFloating` - Sticky cart in bottom-right corner
- `OrderSummaryCard` - Current order summary with total
- `ConfirmOrderDialog` - Confirmation modal with validations
- `EditOrderDialog` - Edit modal (only before 11:30 AM)
- `OrderHistoryTable` - Past orders table with filters

### State Management

- **Cart**: Local state (React Context or Zustand) for fast UI handling
- **Today's Menu**: Server state (Supabase fetch with periodic revalidation)
- **Order Validations**: Server-side in API route (1/day, max 5/week, inventory)

---

## Section 2: Data Flow & Validations

### Order Flow

1. **View Today's Menu**
   - Fetch menu where `menu_date = today` AND `is_published = true`
   - Fetch related dishes
   - Show "Agotado" badge when `available_quantity = 0`
   - Show "Quedan X" when `available_quantity < 5`

2. **Add to Cart (Client)**
   - Click dish → adds to cart (local state)
   - Validate `quantity > 0` before adding
   - Allow increase/decrease in cart
   - Calculate subtotal in real-time

3. **Confirm Order (Server Action)**
   - Validate: NO order today exists for user
   - Validate: NO more than 5 orders this week
   - Validate: dish availability (atomic transaction)
   - Create `order` with unique `order_code` (8 chars)
   - Create `order_items` for each dish
   - Decrement `available_quantity` in `dishes`
   - Send confirmation email (Resend)
   - If fail → rollback and show specific error

4. **Edit Order (Deadline 11:30 AM)**
   - Only allowed if today's `created_at` is before 11:30 AM
   - Fetch current order with items
   - Allow add/remove items or change quantities
   - Validate availability again
   - Update `order` + `order_items`
   - Adjust `available_quantity` (restore removed, decrement added)

### Validation Schema (Zod)

```typescript
const orderItemSchema = z.object({
  dish_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});
```

---

## Section 3: UI/UX Components

### DishCard

- Optimized image (Next.js Image) with placeholder fallback
- Name and description truncated to 2 lines
- Price in MXN format ($85.00)
- Category badge (top corner)
- "Agotado" (red) or "Quedan X" (yellow) badge
- "Add" button or counter (+/-) if in cart
- Hover effect with soft shadow

### MenuGrid

- Top tabs: [Todos] [Platillos] [Bebidas] [Postres]
- Responsive grid: 1 col mobile, 2 tablet, 3 desktop
- Smooth scroll on tab change
- Skeleton loading while fetching
- Empty state if no menu published today

### CartFloating

- Fixed in bottom-right corner
- Badge with item count
- Click → opens `OrderSummaryDialog`
- Bounce animation on add

### ConfirmOrderDialog

- Item list with per-item subtotal
- Large highlighted total
- "I confirm I reviewed my order" checkbox
- "Confirm Order" button (disabled until validated)
- "Keep Editing" button (cancel)

### EditOrderDialog

- Similar to ConfirmOrderDialog but with editable inputs
- Deadline message: "You have until 11:30 AM to edit"
- "Cancel Order" button (with double confirmation)
- "Save Changes" button

---

## Section 4: Error Handling & Edge Cases

### Error Cases with Clear Messages

1. **No menu published today**
   - Message: "No hay menú disponible para hoy. Contacta al administrador."
   - CTA: Refresh button

2. **Already have order today**
   - Message: "Ya tienes un pedido para hoy: {order_code}"
   - CTA: "View my order" (link to detail)

3. **Weekly limit reached**
   - Message: "Alcanzaste el límite de 5 pedidos esta semana. Intenta la próxima."
   - Show current week's order count

4. **Dish sold out during confirmation**
   - Message: "{dish_name} se agotó mientras hacías tu pedido. Elimínalo del carrito."
   - Auto-remove item from cart

5. **Edit deadline passed**
   - Message: "El horario para editar pedidos (11:30 AM) ha terminado."
   - Hide edit buttons, show only "View order"

6. **Network/connection error**
   - Toast: "Error de conexión. Reintenta."
   - Retry button in failed state

### Race Condition Handling

- Use Supabase transaction to decrement inventory
- If fails by `available_quantity < 0`, rollback and show specific error

### Timezone Validation

- Use `America/Mexico_City` for 11:30 AM deadline
- Server-side validation, don't trust client

### Debug Logs

- Log every order attempt (success or failure)
- Log inventory changes

---

## Next Steps

After this design is implemented:

1. Sprint 4: Comanda Dashboard (kitchen view)
2. Sprint 5: Reports & Configuration
3. Sprint 6: DevOps & Deployment

---

**Designed by**: Claude (Kimi)
**Approved by**: Gil Hernandez
**Date**: 2026-02-24
