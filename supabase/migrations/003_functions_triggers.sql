-- Migration 003: Functions and Triggers
-- Business logic functions and database triggers

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Generate unique 8-character order code (helper function)
CREATE OR REPLACE FUNCTION _generate_order_code_helper()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character alphanumeric code
        code := upper(substring(encode(gen_random_bytes(16), 'base64'), 1, 8));

        -- Remove any non-alphanumeric characters (like +, /, =)
        code := regexp_replace(code, '[^A-Za-z0-9]', '', 'g');

        -- Ensure it's exactly 8 characters
        WHILE length(code) < 8 LOOP
            code := code || upper(substring(encode(gen_random_bytes(16), 'base64'), 1, 1));
            code := regexp_replace(code, '[^A-Za-z0-9]', '', 'g');
        END LOOP;

        code := substring(code, 1, 8);

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM orders WHERE order_code = code) INTO exists;

        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate order code for trigger (returns TRIGGER type)
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate unique order code and assign to NEW row
    NEW.order_code := _generate_order_code_helper();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate order creation (1 per day, max 5 per week)
CREATE OR REPLACE FUNCTION validate_order_creation(user_id_param UUID, menu_id_param UUID)
RETURNS TABLE(validation_result TEXT, error_message TEXT) AS $$
DECLARE
    orders_today INTEGER;
    orders_this_week INTEGER;
    week_start DATE;
    week_end DATE;
    current_date_local DATE := CURRENT_DATE AT TIME ZONE 'America/Mexico_City';
BEGIN
    -- Check if user already has an order for today (from the same menu)
    SELECT COUNT(*)
    INTO orders_today
    FROM orders
    WHERE user_id = user_id_param
    AND menu_id = menu_id_param
    AND DATE(created_at AT TIME ZONE 'America/Mexico_City') = current_date_local
    AND status != 'cancelado';

    IF orders_today > 0 THEN
        RETURN QUERY SELECT 'error'::TEXT AS validation_result, 'Ya tienes un pedido para hoy. Solo se permite un pedido por día.'::TEXT AS error_message;
        RETURN;
    END IF;

    -- Calculate week range (Monday to Sunday)
    week_start := current_date_local - (EXTRACT(DOW FROM current_date_local)::INTEGER - 1)::INTEGER;
    week_end := week_start + 6;

    -- Check if user has more than 5 orders this week
    SELECT COUNT(*)
    INTO orders_this_week
    FROM orders
    WHERE user_id = user_id_param
    AND DATE(created_at AT TIME ZONE 'America/Mexico_City') BETWEEN week_start AND week_end
    AND status != 'cancelado';

    IF orders_this_week >= 5 THEN
        RETURN QUERY SELECT 'error'::TEXT AS validation_result, 'Has alcanzado el máximo de 5 pedidos esta semana.'::TEXT AS error_message;
        RETURN;
    END IF;

    -- All validations passed
    RETURN QUERY SELECT 'success'::TEXT AS validation_result, NULL::TEXT AS error_message;
END;
$$ LANGUAGE plpgsql;

-- Function: Update dish availability when order is created
CREATE OR REPLACE FUNCTION update_dish_availability_on_order()
RETURNS TRIGGER AS $$
DECLARE
    order_item RECORD;
    dish_record RECORD;
BEGIN
    -- For each order item, decrement available quantity
    FOR order_item IN
        SELECT dish_id, quantity
        FROM order_items
        WHERE order_id = NEW.id
    LOOP
        -- Lock the dish row to prevent race conditions
        SELECT * INTO dish_record
        FROM dishes
        WHERE dishes.id = order_item.dish_id
        FOR UPDATE;

        -- Check availability
        IF dish_record.available_quantity < order_item.quantity THEN
            RAISE EXCEPTION 'No hay suficiente cantidad disponible para % (disponible: %, solicitado: %)',
                dish_record.name,
                dish_record.available_quantity,
                order_item.quantity;
        END IF;

        -- Update available quantity
        UPDATE dishes
        SET available_quantity = available_quantity - order_item.quantity
        WHERE dishes.id = order_item.dish_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Restore dish availability when order is cancelled
CREATE OR REPLACE FUNCTION restore_dish_availability_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    -- Only restore if order is being cancelled
    IF OLD.status != 'cancelado' AND NEW.status = 'cancelado' THEN
        -- Restore quantities for all items in the order
        UPDATE dishes
        SET available_quantity = dishes.available_quantity + order_items.quantity
        FROM order_items
        WHERE order_items.order_id = NEW.id
        AND order_items.dish_id = dishes.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate status transitions
    CASE OLD.status
        WHEN 'pendiente' THEN
            IF NEW.status NOT IN ('confirmado', 'cancelado') THEN
                RAISE EXCEPTION 'Estado inválido. Desde pendiente solo puede ir a: confirmado o cancelado';
            END IF;
        WHEN 'confirmado' THEN
            IF NEW.status NOT IN ('en_preparacion', 'cancelado') THEN
                RAISE EXCEPTION 'Estado inválido. Desde confirmado solo puede ir a: en_preparacion o cancelado';
            END IF;
        WHEN 'en_preparacion' THEN
            IF NEW.status NOT IN ('listo', 'cancelado') THEN
                RAISE EXCEPTION 'Estado inválido. Desde en_preparacion solo puede ir a: listo o cancelado';
            END IF;
        WHEN 'listo' THEN
            IF NEW.status NOT IN ('entregado') THEN
                RAISE EXCEPTION 'Estado inválido. Desde listo solo puede ir a: entregado';
            END IF;
        WHEN 'entregado' THEN
            RAISE EXCEPTION 'No se puede cambiar el estado de un pedido entregado';
        WHEN 'cancelado' THEN
            RAISE EXCEPTION 'No se puede cambiar el estado de un pedido cancelado';
    END CASE;

    -- Set delivered_at timestamp when order is marked as delivered
    IF NEW.status = 'entregado' AND (OLD.status != 'entregado' OR OLD.delivered_at IS NULL) THEN
        NEW.delivered_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City';
    END IF;

    -- Disable editing when order is confirmed
    IF NEW.status IN ('confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado') THEN
        IF NEW.can_edit = true THEN
            NEW.can_edit = false;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate menu uniqueness before publication
CREATE OR REPLACE FUNCTION validate_menu_publication()
RETURNS TRIGGER AS $$
DECLARE
    menu_count INTEGER;
BEGIN
    -- Only validate when is_published is being set to true
    IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
        -- Check if there's already a published menu for this date
        SELECT COUNT(*)
        INTO menu_count
        FROM menus
        WHERE menu_date = NEW.menu_date
        AND is_published = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

        IF menu_count > 0 THEN
            RAISE EXCEPTION 'Ya existe un menú publicado para la fecha %', NEW.menu_date;
        END IF;

        -- Set published_at timestamp
        NEW.published_at := CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Generate order code before insert
CREATE TRIGGER generate_order_code_before_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_code();

-- Trigger: Update dish availability when order is created
CREATE TRIGGER update_dish_availability_on_order_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_dish_availability_on_order();

-- Trigger: Restore dish availability when order is cancelled
CREATE TRIGGER restore_dish_availability_on_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_dish_availability_on_cancel();

-- Trigger: Handle order status changes
CREATE TRIGGER handle_order_status_change
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_change();

-- Trigger: Validate menu publication
CREATE TRIGGER validate_menu_publication
    BEFORE INSERT OR UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION validate_menu_publication();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get today's menu
CREATE OR REPLACE FUNCTION get_today_menu()
RETURNS TABLE(
    menu_id UUID,
    menu_date DATE,
    dish_id UUID,
    dish_name TEXT,
    dish_description TEXT,
    dish_price DECIMAL(10,2),
    dish_image_url TEXT,
    dish_category TEXT,
    dish_available_quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS menu_id,
        m.menu_date,
        d.id AS dish_id,
        d.name AS dish_name,
        d.description AS dish_description,
        d.price AS dish_price,
        d.image_url AS dish_image_url,
        d.category AS dish_category,
        d.available_quantity AS dish_available_quantity
    FROM menus m
    INNER JOIN dishes d ON d.menu_id = m.id
    WHERE m.menu_date = CURRENT_DATE AT TIME ZONE 'America/Mexico_City'
    AND m.is_published = true
    ORDER BY d.category, d.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's order for today
CREATE OR REPLACE FUNCTION get_user_today_order(user_id_param UUID)
RETURNS TABLE(
    order_id UUID,
    order_code TEXT,
    menu_id UUID,
    status TEXT,
    total_amount DECIMAL(10,2),
    can_edit BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id AS order_id,
        o.order_code,
        o.menu_id,
        o.status,
        o.total_amount,
        o.can_edit,
        o.created_at
    FROM orders o
    INNER JOIN menus m ON m.id = o.menu_id
    WHERE o.user_id = user_id_param
    AND m.menu_date = CURRENT_DATE AT TIME ZONE 'America/Mexico_City'
    AND o.status != 'cancelado'
    ORDER BY o.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
