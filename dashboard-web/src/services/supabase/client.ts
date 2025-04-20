import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required. Verify your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export database types
export type Tables = {
  users: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    rut: string;
    phone?: string;
    address?: string;
    profile_image?: string;
    birthday?: string;
    image_approved?: boolean;
    role: string;
    created_at?: string;
    updated_at?: string;
  };
  
  restaurants: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    image?: string;
    admin_id: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  
  menu_categories: {
    id: string;
    name: string;
    description?: string;
    restaurant_id: string;
    created_at?: string;
    updated_at?: string;
  };
  
  menu_items: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    available: boolean;
    category_id?: string;
    restaurant_id: string;
    created_at?: string;
    updated_at?: string;
  };
  
  orders: {
    id: string;
    user_id: string;
    restaurant_id: string;
    status: string;
    total: number;
    delivery_address?: string;
    delivery_notes?: string;
    delivery_fee?: number;
    estimated_delivery_time?: string;
    actual_delivery_time?: string;
    created_at?: string;
    updated_at?: string;
  };
  
  order_items: {
    id: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    price: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  };
  
  delivery_people: {
    id: string;
    user_id: string;
    is_active?: boolean;
    vehicle_type?: string;
    vehicle_plate?: string;
    last_known_location?: any;
    created_at?: string;
    updated_at?: string;
  };
  
  order_assignments: {
    id: string;
    order_id: string;
    delivery_person_id: string;
    assigned_at?: string;
    accepted_at?: string;
    picked_up_at?: string;
    delivered_at?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
  
  notifications: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read?: boolean;
    type?: string;
    reference_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  
  payments: {
    id: string;
    order_id: string;
    amount: number;
    payment_method?: string;
    transaction_id?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
};