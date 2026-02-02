-- Migration 004: Seed Data
-- Insert initial data for development and testing

-- NOTE: This migration should only be run in development/staging environments
-- For production, create initial data through the application UI

-- ============================================================================
-- COMPANIES
-- ============================================================================

INSERT INTO companies (id, name, is_active) VALUES
    ('01234567-89ab-cdef-0123-456789abcdef'::UUID, 'Empresa Demo SA de CV', true),
    ('abcdef01-2345-6789-abcd-ef0123456789'::UUID, 'Tech Solutions MX', true),
    ('fedcba98-7654-3210-fedc-ba9876543210'::UUID, 'Consultores del Norte', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- USERS (Demo users)
-- ============================================================================

-- Admin user
INSERT INTO users (id, email, full_name, phone, company_id, role, is_active) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::UUID, 'admin@demo.com', 'Admin General', '+528112345678', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Editor user
INSERT INTO users (id, email, full_name, phone, company_id, role, is_active) VALUES
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'::UUID, 'editor@demo.com', 'Editor de Menús', '+528112345679', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'editor_menu', true)
ON CONFLICT (email) DO NOTHING;

-- Comanda user
INSERT INTO users (id, email, full_name, phone, company_id, role, is_active) VALUES
    ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f'::UUID, 'comanda@demo.com', 'Cocina Principal', '+528112345680', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'comanda_user', true)
ON CONFLICT (email) DO NOTHING;

-- Employee users (Company 1)
INSERT INTO users (id, email, full_name, phone, company_id, role, is_active) VALUES
    ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a'::UUID, 'juan.perez@demo.com', 'Juan Pérez', '+528112345681', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'empleado', true),
    ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b'::UUID, 'maria.garcia@demo.com', 'María García', '+528112345682', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'empleado', true),
    ('f6a7b8c9-d0e1-4f6a-3b4c-5d6e7f8a9b0c'::UUID, 'carlos.lopez@demo.com', 'Carlos López', '+528112345683', '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'empleado', true)
ON CONFLICT (email) DO NOTHING;

-- Employee users (Company 2)
INSERT INTO users (id, email, full_name, phone, company_id, role, is_active) VALUES
    ('1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'::UUID, 'ana.rodriguez@demo.com', 'Ana Rodríguez', '+528112345684', 'abcdef01-2345-6789-abcd-ef0123456789'::UUID, 'empleado', true),
    ('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e'::UUID, 'luis.martinez@demo.com', 'Luis Martínez', '+528112345685', 'abcdef01-2345-6789-abcd-ef0123456789'::UUID, 'empleado', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE MENU (Today's menu for testing)
-- ============================================================================

-- Note: This creates a menu for today. For testing, you can adjust the date
INSERT INTO menus (id, menu_date, is_published, published_at, created_by) VALUES
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     CURRENT_DATE AT TIME ZONE 'America/Mexico_City',
     true,
     CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City',
     'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::UUID)
ON CONFLICT (menu_date) DO NOTHING;

-- ============================================================================
-- SAMPLE DISHES
-- ============================================================================

-- Platillos
INSERT INTO dishes (menu_id, name, description, price, category, initial_quantity, available_quantity) VALUES
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Tacos de Carnitas',
     'Tres tacos de carnitas michoacanas con cilantro, cebolla y salsa verde. Acompañados de limón y frijoles charros.',
     85.00,
     'platillo',
     20,
     20),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Milanesa de Pollo',
     'Milanesa de pollo empanizada con ensalada de verduras y arroz blanco.',
     95.00,
     'platillo',
     15,
     15),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Enchiladas Verdes',
     'Tres enchiladas de pollo con salsa verde, crema, queso y cebolla.',
     80.00,
     'platillo',
     25,
     25),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Pozole Rojo',
     'Tazón de pozole rojo con carne de puerco, rábano, lechuga, cebolla y orégano. Con tostadas.',
     90.00,
     'platillo',
     18,
     18),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Filete de Pescado',
     'Filete de pescado empanizado con puré de papa y ensalada fresca.',
     110.00,
     'platillo',
     12,
     12);

-- Bebidas
INSERT INTO dishes (menu_id, name, description, price, category, initial_quantity, available_quantity) VALUES
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Agua de Horchata',
     'Agua fresca de horchata de arroz con canela. Vaso de 500ml.',
     25.00,
     'bebida',
     40,
     40),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Agua de Jamaica',
     'Agua fresca de Jamaica. Vaso de 500ml.',
     25.00,
     'bebida',
     35,
     35),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Refresco de Cola',
     'Refresco de cola regular. Botella de 600ml.',
     20.00,
     'bebida',
     50,
     50),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Jugo de Naranja',
     'Jugo de naranja natural. Vaso de 350ml.',
     30.00,
     'bebida',
     25,
     25);

-- Postres
INSERT INTO dishes (menu_id, name, description, price, category, initial_quantity, available_quantity) VALUES
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Flan Napolitano',
     'Caja de flan napolitano con caramelo y crema.',
     35.00,
     'postre',
     20,
     20),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Pastel de Chocolate',
     'Rebanada de pastel de chocolate con betún.',
     40.00,
     'postre',
     15,
     15),
    ('9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d'::UUID,
     'Gelatina de Mosaico',
     'Gelatina de mosaico de sabores con leche condensada.',
     25.00,
     'postre',
     30,
     30);

-- ============================================================================
-- NOTES FOR DEVELOPERS
-- ============================================================================

/*
Demo credentials for testing:

Admin User:
  Email: admin@demo.com
  Role: admin
  Password: (set via Supabase Auth)

Editor User:
  Email: editor@demo.com
  Role: editor_menu
  Password: (set via Supabase Auth)

Comanda User:
  Email: comanda@demo.com
  Role: comanda_user
  Password: (set via Supabase Auth)

Employee Users:
  Email: juan.perez@demo.com
  Role: empleado
  Company: Empresa Demo SA de CV

  Email: maria.garcia@demo.com
  Role: empleado
  Company: Empresa Demo SA de CV

  Email: ana.rodriguez@demo.com
  Role: empleado
  Company: Tech Solutions MX

To test the system:
1. Create users in Supabase Auth with these emails
2. They will be automatically linked to the users table via email
3. Use the different roles to test permissions
4. The sample menu is created for today's date
5. All dishes have full availability for testing orders

To create more test data, you can:
- Add more companies to the companies table
- Add more users with different roles
- Create menus for different dates
- Add more dishes with different categories
*/

-- ============================================================================
-- INDEX: Quick reference for seed data
-- ============================================================================

-- Companies: 3 companies
-- Users: 9 users (1 admin, 1 editor, 1 comanda, 6 employees)
-- Menus: 1 menu for today
-- Dishes: 12 dishes (5 platillos, 4 bebidas, 3 postres)

-- Total seed data: Ready for comprehensive testing
