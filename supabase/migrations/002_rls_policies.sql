-- Migration 002: Row Level Security (RLS) Policies
-- Implements security policies to restrict data access by role

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPANIES POLICIES
-- ============================================================================

-- Companies: Admin can read all, editors/read-only can read all
CREATE POLICY "Companies: Admins can view all companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Companies: Admin can insert
CREATE POLICY "Companies: Admins can insert"
    ON companies FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Companies: Admin can update
CREATE POLICY "Companies: Admins can update"
    ON companies FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users: Admin can view all users
CREATE POLICY "Users: Admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Users: Everyone can view their own profile
CREATE POLICY "Users: Can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users: Admin can insert users
CREATE POLICY "Users: Admins can insert"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Users: Admin can update all users
CREATE POLICY "Users: Admins can update all users"
    ON users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Users: Users can update their own profile (limited fields)
CREATE POLICY "Users: Can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        -- Note: Field-level restrictions are enforced at the application layer
        -- RLS ensures users can only update their own records
    );

-- ============================================================================
-- MENUS POLICIES
-- ============================================================================

-- Menus: Admin and Editor can view all menus
CREATE POLICY "Menus: Admins and Editors can view all"
    ON menus FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Menus: Employees can only view published menus
CREATE POLICY "Menus: Employees can view published menus"
    ON menus FOR SELECT
    TO authenticated
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        )
    );

-- Menus: Comanda can view published menus
CREATE POLICY "Menus: Comanda can view published menus"
    ON menus FOR SELECT
    TO authenticated
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'comanda_user'
        )
    );

-- Menus: Admin and Editor can insert
CREATE POLICY "Menus: Admins and Editors can insert"
    ON menus FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Menus: Admin and Editor can update
CREATE POLICY "Menus: Admins and Editors can update"
    ON menus FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Menus: Admin can delete
CREATE POLICY "Menus: Admins can delete"
    ON menus FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- DISHES POLICIES
-- ============================================================================

-- Dishes: Admin and Editor can view all dishes
CREATE POLICY "Dishes: Admins and Editors can view all"
    ON dishes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Dishes: Employees and Comanda can view dishes from published menus
CREATE POLICY "Dishes: Employees can view from published menus"
    ON dishes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM menus
            WHERE menus.id = dishes.menu_id
            AND menus.is_published = true
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('empleado', 'comanda_user')
        )
    );

-- Dishes: Admin and Editor can insert
CREATE POLICY "Dishes: Admins and Editors can insert"
    ON dishes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Dishes: Admin and Editor can update
CREATE POLICY "Dishes: Admins and Editors can update"
    ON dishes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'editor_menu')
        )
    );

-- Dishes: Admin can delete
CREATE POLICY "Dishes: Admins can delete"
    ON dishes FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================

-- Orders: Admin and Comanda can view all orders
CREATE POLICY "Orders: Admins and Comanda can view all"
    ON orders FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'comanda_user')
        )
    );

-- Orders: Employees can only view their own orders
CREATE POLICY "Orders: Employees can view own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        )
    );

-- Orders: Employees can insert (create own orders)
CREATE POLICY "Orders: Employees can insert own orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        )
    );

-- Orders: Admin and Comanda can update (status changes)
CREATE POLICY "Orders: Admins and Comanda can update"
    ON orders FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'comanda_user')
        )
    );

-- Orders: Employees can update own orders (before 11:30 AM)
CREATE POLICY "Orders: Employees can update own orders before deadline"
    ON orders FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() AND
        can_edit = true AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        ) AND
        -- Check if current time is before 11:30 AM Mexico City time
        EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City') < 11 OR
        (EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City') = 11 AND
         EXTRACT(MINUTE FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City') < 30)
    )
    WITH CHECK (
        user_id = auth.uid() AND
        can_edit = true
    );

-- ============================================================================
-- ORDER ITEMS POLICIES
-- ============================================================================

-- Order items: Admin and Comanda can view all
CREATE POLICY "Order Items: Admins and Comanda can view all"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'comanda_user')
        )
    );

-- Order items: Employees can view items from own orders
CREATE POLICY "Order Items: Employees can view own order items"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        )
    );

-- Order items: Employees can insert (when creating own order)
CREATE POLICY "Order Items: Employees can insert to own orders"
    ON order_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'empleado'
        )
    );

-- Order items: Admin and Comanda can update
CREATE POLICY "Order Items: Admins and Comanda can update"
    ON order_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'comanda_user')
        )
    );

-- Order items: Admin can delete
CREATE POLICY "Order Items: Admins can delete"
    ON order_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );
