import { supabase, Tables } from './client';

export type Restaurant = Tables['restaurants'];
export type MenuCategory = Tables['menu_categories'];
export type MenuItem = Tables['menu_items'];

// Type for frontend compatibility
export type MenuItemWithFrontendFields = MenuItem & {
  categoryId?: string;
  restaurantId?: string;
  isAvailable?: boolean;
  imageUrl?: string;
};

export const restaurantService = {
  // Get all restaurants
  getRestaurants: async (): Promise<Restaurant[]> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Restaurant[];
  },

  // Get restaurant by ID
  getRestaurantById: async (id: string): Promise<Restaurant> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  // Get restaurants by admin ID
  getRestaurantsByAdminId: async (adminId: string): Promise<Restaurant[]> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('admin_id', adminId)
      .order('name');
    
    if (error) throw error;
    return data as Restaurant[];
  },

  // Create a restaurant
  createRestaurant: async (
    restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Restaurant> => {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  // Update a restaurant
  updateRestaurant: async (
    id: string, 
    restaurantData: Partial<Restaurant>
  ): Promise<Restaurant> => {
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...restaurantData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('restaurants')
      .update(dataWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Restaurant;
  },

  // Delete a restaurant
  deleteRestaurant: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get menu categories
  getMenuCategories: async (restaurantId?: string): Promise<MenuCategory[]> => {
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

  // Create a menu category
  createMenuCategory: async (
    categoryData: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MenuCategory> => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  // Update a menu category
  updateMenuCategory: async (
    id: string, 
    categoryData: Partial<MenuCategory>
  ): Promise<MenuCategory> => {
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...categoryData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('menu_categories')
      .update(dataWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  // Delete a menu category
  deleteMenuCategory: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get menu items
  getMenuItems: async (
    params: { categoryId?: string; restaurantId?: string } = {}
  ): Promise<MenuItemWithFrontendFields[]> => {
    const { categoryId, restaurantId } = params;
    
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
    
    // Normalize data for frontend compatibility
    return data.map(item => ({
      ...item,
      categoryId: item.category_id,
      restaurantId: item.restaurant_id,
      isAvailable: item.available,
      imageUrl: item.image
    }));
  },

  // Create a menu item
  createMenuItem: async (itemData: any): Promise<MenuItemWithFrontendFields> => {
    // Normalize data for Supabase
    const supabaseData = {
      name: itemData.name,
      description: itemData.description || null,
      price: parseFloat(itemData.price?.toString() || '0'),
      image: itemData.image || itemData.imageUrl || null,
      available: itemData.available !== undefined 
        ? itemData.available 
        : (itemData.isAvailable !== undefined ? itemData.isAvailable : true),
      category_id: itemData.category_id || itemData.categoryId || null,
      restaurant_id: itemData.restaurant_id || itemData.restaurantId
    };

    const { data, error } = await supabase
      .from('menu_items')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Normalize response for frontend
    return {
      ...data,
      categoryId: data.category_id,
      restaurantId: data.restaurant_id,
      isAvailable: data.available,
      imageUrl: data.image
    };
  },

  // Update a menu item
  updateMenuItem: async (
    id: string, 
    itemData: any
  ): Promise<MenuItemWithFrontendFields> => {
    // Normalize data for Supabase
    const supabaseData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (itemData.name !== undefined) supabaseData.name = itemData.name;
    if (itemData.description !== undefined) supabaseData.description = itemData.description;
    if (itemData.price !== undefined) supabaseData.price = parseFloat(itemData.price.toString());
    if (itemData.image !== undefined || itemData.imageUrl !== undefined) {
      supabaseData.image = itemData.image || itemData.imageUrl;
    }
    if (itemData.available !== undefined || itemData.isAvailable !== undefined) {
      supabaseData.available = itemData.available !== undefined 
        ? itemData.available 
        : itemData.isAvailable;
    }
    if (itemData.category_id !== undefined || itemData.categoryId !== undefined) {
      supabaseData.category_id = itemData.category_id || itemData.categoryId;
    }
    if (itemData.restaurant_id !== undefined || itemData.restaurantId !== undefined) {
      supabaseData.restaurant_id = itemData.restaurant_id || itemData.restaurantId;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error in Supabase:', error);
      throw error;
    }
    
    // Normalize response for frontend
    return {
      ...data,
      categoryId: data.category_id,
      restaurantId: data.restaurant_id,
      isAvailable: data.available,
      imageUrl: data.image
    };
  },

  // Delete a menu item
  deleteMenuItem: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};