/**
 * Database Types
 *
 * TypeScript types matching the database schema.
 * Generated based on Supabase schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'empleado' | 'comanda_user' | 'editor_menu' | 'admin';
export type OrderStatus = 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
export type DishCategory = 'platillo' | 'bebida' | 'postre';

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          company_id: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          company_id?: string | null;
          role: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          company_id?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menus: {
        Row: {
          id: string;
          menu_date: string;
          is_published: boolean;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_date: string;
          is_published?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_date?: string;
          is_published?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      dishes: {
        Row: {
          id: string;
          menu_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          category: DishCategory;
          initial_quantity: number;
          available_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          category: DishCategory;
          initial_quantity?: number;
          available_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category?: DishCategory;
          initial_quantity?: number;
          available_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          user_id: string;
          menu_id: string;
          company_id: string;
          status: OrderStatus;
          total_amount: number;
          can_edit: boolean;
          created_at: string;
          updated_at: string;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          order_code?: string;
          user_id: string;
          menu_id: string;
          company_id: string;
          status?: OrderStatus;
          total_amount?: number;
          can_edit?: boolean;
          created_at?: string;
          updated_at?: string;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          order_code?: string;
          user_id?: string;
          menu_id?: string;
          company_id?: string;
          status?: OrderStatus;
          total_amount?: number;
          can_edit?: boolean;
          created_at?: string;
          updated_at?: string;
          delivered_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          dish_id: string;
          quantity: number;
          price_at_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          dish_id: string;
          quantity: number;
          price_at_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          dish_id?: string;
          quantity?: number;
          price_at_order?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * Application-specific types extending the database types
 */

export interface User extends Database['public']['Tables']['users']['Row'] {}
export interface Company extends Database['public']['Tables']['companies']['Row'] {}
export interface Menu extends Database['public']['Tables']['menus']['Row'] {}
export interface Dish extends Database['public']['Tables']['dishes']['Row'] {}
export interface Order extends Database['public']['Tables']['orders']['Row'] {}
export interface OrderItem extends Database['public']['Tables']['order_items']['Row'] {}

/**
 * Extended types with relations
 */

export interface UserWithCompany extends User {
  company?: Company | null;
}

export interface MenuWithDishes extends Menu {
  dishes?: Dish[];
}

export interface OrderWithItems extends Order {
  items?: (OrderItem & { dish: Dish })[];
  user?: User;
  menu?: Menu;
}

export interface DishWithMenu extends Dish {
  menu?: Menu;
}

/**
 * Form types
 */

export interface LoginForm {
  email: string;
}

export interface ProfileForm {
  full_name: string;
  phone: string;
}

export interface MenuForm {
  menu_date: string;
}

export interface DishForm {
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  initial_quantity: number;
  image_url?: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

/**
 * API Response types
 */

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * CSV Import types
 */

export interface CSVRow {
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad: string;
  nombre_imagen: string;
}

export interface CSVParseResult {
  data: CSVRow[];
  errors: Array<{ row: number; message: string }>;
}

/**
 * Report types
 */

export interface ReportFilters {
  type: 'weekly' | 'daily' | 'company' | 'employee';
  startDate: string;
  endDate: string;
  companyId?: string;
  userId?: string;
}

export interface ReportData {
  orders: Order[];
  totalAmount: number;
  orderCount: number;
}
