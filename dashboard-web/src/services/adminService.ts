import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  created_at: string;
  rut?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  birthday?: string;
  imageApproved?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  description?: string;
  website?: string;
  openingHours?: string[];
}

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  restaurant_name?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  image?: string;
  slug?: string;
  isActive: boolean;
  createdAt?: string;
  restaurantId?: string;
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total restaurants
    const { count: totalRestaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (restaurantsError) throw restaurantsError;

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) throw ordersError;

    // Get total revenue
    const { data: revenue, error: revenueError } = await supabase
      .from('orders')
      .select('total');

    if (revenueError) throw revenueError;

    const totalRevenue = revenue.reduce((sum, order) => sum + order.total, 0);

    return {
      totalUsers: totalUsers || 0,
      totalRestaurants: totalRestaurants || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: totalRevenue || 0,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

// Restaurant Management
export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting restaurants:', error);
    throw error;
  }
}

export async function createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'created_at'>): Promise<Restaurant> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
}

export async function updateRestaurant(id: string, restaurantData: Partial<Restaurant>): Promise<Restaurant> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
}

export async function deleteRestaurant(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
}

// User Management
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
  try {
    // Primero creamos el usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: Math.random().toString(36).slice(-8), // Contraseña temporal
      email_confirm: true,
      user_metadata: { 
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role 
      }
    });

    if (authError) throw authError;

    // Ahora actualizamos los datos adicionales en la tabla users
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        rut: userData.rut,
        phone: userData.phone,
        address: userData.address,
        profile_image: userData.profileImage,
        birthday: userData.birthday
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    // Crear un objeto con los campos mapeados correctamente para la base de datos
    const dbData: any = {};
    
    if (userData.name) dbData.name = userData.name;
    if (userData.firstName) dbData.first_name = userData.firstName;
    if (userData.lastName) dbData.last_name = userData.lastName;
    if (userData.role) dbData.role = userData.role;
    if (userData.rut) dbData.rut = userData.rut;
    if (userData.phone) dbData.phone = userData.phone;
    if (userData.address) dbData.address = userData.address;
    if (userData.profileImage) dbData.profile_image = userData.profileImage;
    if (userData.birthday) dbData.birthday = userData.birthday;
    if (userData.imageApproved !== undefined) dbData.image_approved = userData.imageApproved;

    // Si están definidos firstName y lastName, actualizar también name
    if (userData.firstName && userData.lastName) {
      dbData.name = `${userData.firstName} ${userData.lastName}`;
    }

    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    // Primero eliminamos el usuario de la tabla users
    const { error: dataError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (dataError) throw dataError;

    // Luego eliminamos el usuario de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw authError;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Order Management
export async function getOrders(status?: string, restaurantId?: string): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id(name),
        restaurant:restaurant_id(name),
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros si se proporcionan
    if (status) {
      query = query.eq('status', status);
    }

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transformar la respuesta para incluir nombres de restaurante y cliente
    const formattedData = data?.map(order => ({
      ...order,
      customer_name: order.customer?.name,
      restaurant_name: order.restaurant?.name,
      items: order.items
    }));

    return formattedData || [];
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getOrderDetails(id: string): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id(id, name, email, phone),
        restaurant:restaurant_id(id, name, address, phone),
        items:order_items(id, menu_item_id, quantity, price, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting order details:', error);
    throw error;
  }
}

// Category Management
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Transformar los nombres de columnas para mantener consistencia con Frontend
    const formattedData = data?.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      displayOrder: category.display_order,
      image: category.image,
      slug: category.slug,
      isActive: category.is_active,
      createdAt: category.created_at,
      restaurantId: category.restaurant_id
    }));

    return formattedData || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  try {
    const dbData = {
      name: categoryData.name,
      description: categoryData.description,
      display_order: categoryData.displayOrder,
      image: categoryData.image,
      is_active: categoryData.isActive,
      restaurant_id: categoryData.restaurantId,
      // Generar slug a partir del nombre
      slug: categoryData.name.toLowerCase()
                            .replace(/\s+/g, '-')    // Reemplazar espacios por guiones
                            .replace(/[^\w\-]+/g, '') // Eliminar caracteres no alfanuméricos
                            .replace(/\-\-+/g, '-')   // Reemplazar múltiples guiones por uno solo
                            .replace(/^-+/, '')       // Eliminar guiones al inicio
                            .replace(/-+$/, '')       // Eliminar guiones al final
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    
    // Transformar la respuesta
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      displayOrder: data.display_order,
      image: data.image,
      slug: data.slug,
      isActive: data.is_active,
      createdAt: data.created_at,
      restaurantId: data.restaurant_id
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
  try {
    const dbData: any = {};
    
    if (categoryData.name) {
      dbData.name = categoryData.name;
      
      // Si se actualiza el nombre, actualizar también el slug
      dbData.slug = categoryData.name.toLowerCase()
                             .replace(/\s+/g, '-')
                             .replace(/[^\w\-]+/g, '')
                             .replace(/\-\-+/g, '-')
                             .replace(/^-+/, '')
                             .replace(/-+$/, '');
    }
    
    if (categoryData.description !== undefined) dbData.description = categoryData.description;
    if (categoryData.displayOrder !== undefined) dbData.display_order = categoryData.displayOrder;
    if (categoryData.image !== undefined) dbData.image = categoryData.image;
    if (categoryData.isActive !== undefined) dbData.is_active = categoryData.isActive;
    if (categoryData.restaurantId) dbData.restaurant_id = categoryData.restaurantId;

    const { data, error } = await supabase
      .from('categories')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Transformar la respuesta
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      displayOrder: data.display_order,
      image: data.image,
      slug: data.slug,
      isActive: data.is_active,
      createdAt: data.created_at,
      restaurantId: data.restaurant_id
    };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function updateCategoriesOrder(updates: { id: string, displayOrder: number }[]): Promise<void> {
  try {
    // Supabase no tiene un método para actualizaciones en lote, 
    // por lo que debemos hacer múltiples llamadas en una transacción si es posible
    
    // Puedes usar la función rpc para llamar a una función PostgreSQL personalizada
    // Pero aquí, hacemos las actualizaciones una por una
    for (const update of updates) {
      const { error } = await supabase
        .from('categories')
        .update({ display_order: update.displayOrder })
        .eq('id', update.id);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating categories order:', error);
    throw error;
  }
}