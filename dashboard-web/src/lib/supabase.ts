import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required. Please check your environment variables.');
}

// Create Supabase client - will be redirected to use the centralized client from services/supabase/client.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to verify user authentication - now primarily handled by authService in services/supabase
export const verifyAuth = async () => {
  try {
    console.log('Verifying authentication with Supabase...');

    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData?.user) {
      console.warn('User not authenticated or error:', error);
      
      // In development mode, allow access for testing if env var is set
      const skipAuthInDev = process.env.NEXT_PUBLIC_SKIP_AUTH_IN_DEV === 'true';
      if (process.env.NODE_ENV === 'development' && skipAuthInDev) {
        console.log('Development mode: allowing access despite not being authenticated');
        return true;
      }
      
      return false;
    }

    console.log('User authenticated:', userData.user.email);

    // Check if the user has a role in metadata
    const userRole = userData.user.user_metadata?.role || 
                    userData.user.app_metadata?.role;

    // In production, verify the role
    if (process.env.NODE_ENV === 'production') {
      if (userRole !== 'admin' && userRole !== 'restaurant_admin') {
        console.warn('User authenticated but does not have admin role');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error verifying authentication:', error);

    // In development mode, allow access for testing if env var is set
    const skipAuthInDev = process.env.NEXT_PUBLIC_SKIP_AUTH_IN_DEV === 'true';
    if (process.env.NODE_ENV === 'development' && skipAuthInDev) {
      console.log('Development mode: allowing access despite error');
      return true;
    }

    return false;
  }
};

// Tipos para las tablas en Supabase
export type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  admin_id: string;
  created_at?: string;
  updated_at?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  created_at?: string;
  updated_at?: string;
};

export type MenuItem = {
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

// Servicios para interactuar con Supabase
export const supabaseService = {
  // Restaurantes
  getRestaurants: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Restaurant[];
  },

  getRestaurantById: async (id: string) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  createRestaurant: async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  updateRestaurant: async (id: string, restaurantData: Partial<Restaurant>) => {
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  deleteRestaurant: async (id: string) => {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Categorías de menú
  getMenuCategories: async (restaurantId?: string) => {
    let query = supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as MenuCategory[];
  },

  createMenuCategory: async (categoryData: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  updateMenuCategory: async (id: string, categoryData: Partial<MenuCategory>) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  deleteMenuCategory: async (id: string) => {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Ítems de menú
  getMenuItems: async (categoryId?: string, restaurantId?: string) => {
    let query = supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Normalizar los datos para la interfaz de usuario
    const normalizedItems = data.map(item => ({
      ...item,
      categoryId: item.category_id, // Agregar campo categoryId para compatibilidad con el frontend
      restaurantId: item.restaurant_id, // Agregar campo restaurantId para compatibilidad con el frontend
      isAvailable: item.available, // Agregar campo isAvailable para compatibilidad con el frontend
      imageUrl: item.image // Agregar campo imageUrl para compatibilidad con el frontend
    }));
    
    return normalizedItems;
  },

  createMenuItem: async (itemData: any) => {
    // Asegurar que los campos tengan el formato correcto para Supabase
    const supabaseData = {
      name: itemData.name,
      description: itemData.description || null,
      price: parseFloat(itemData.price?.toString() || '0'),
      image: itemData.image || itemData.imageUrl || null,
      available: itemData.available !== undefined ? itemData.available : (itemData.isAvailable !== undefined ? itemData.isAvailable : true),
      category_id: itemData.category_id || itemData.categoryId || null,
      restaurant_id: itemData.restaurant_id || itemData.restaurantId
    };

    const { data, error } = await supabase
      .from('menu_items')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Normalizar la respuesta para el frontend
    return {
      ...data,
      categoryId: data.category_id,
      restaurantId: data.restaurant_id,
      isAvailable: data.available,
      imageUrl: data.image
    };
  },

  updateMenuItem: async (id: string, itemData: any) => {
    // Asegurar que los campos tengan el formato correcto para Supabase
    const supabaseData = {
      ...(itemData.name !== undefined && { name: itemData.name }),
      ...(itemData.description !== undefined && { description: itemData.description }),
      ...(itemData.price !== undefined && { price: parseFloat(itemData.price.toString()) }),
      ...((itemData.image !== undefined || itemData.imageUrl !== undefined) && { 
        image: itemData.image || itemData.imageUrl
      }),
      ...((itemData.available !== undefined || itemData.isAvailable !== undefined) && { 
        available: itemData.available !== undefined ? itemData.available : itemData.isAvailable 
      }),
      ...((itemData.category_id !== undefined || itemData.categoryId !== undefined) && { 
        category_id: itemData.category_id || itemData.categoryId
      }),
      ...((itemData.restaurant_id !== undefined || itemData.restaurantId !== undefined) && { 
        restaurant_id: itemData.restaurant_id || itemData.restaurantId
      })
    };

    console.log('Actualizando elemento en Supabase con datos:', supabaseData);

    const { data, error } = await supabase
      .from('menu_items')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    
    // Normalizar la respuesta para el frontend
    return {
      ...data,
      categoryId: data.category_id,
      restaurantId: data.restaurant_id,
      isAvailable: data.available,
      imageUrl: data.image
    };
  },

  deleteMenuItem: async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};