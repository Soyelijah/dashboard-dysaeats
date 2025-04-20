import { supabase } from './client';
import { analyticsService } from './analyticsService';
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { userService } from './userService';
import { UserRole } from './userService';
import { restaurantService } from './restaurantService';

// Definir tipos para los datos del panel de administración
export interface AdminDashboardStats {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      createdAt: string;
    }>;
  };
  restaurants: {
    total: number;
    active: number;
    recentRestaurants: Array<{
      id: string;
      name: string;
      createdAt: string;
    }>;
  };
  orders: {
    today: number;
    total: number;
    byStatus: Record<string, number>;
    recentOrders: Array<{
      id: string;
      restaurantName: string;
      userName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
  revenue: {
    today: number;
    total: number;
    changePercentage: number;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    entityType: string;
    entityId: string;
  }>;
}

export const adminDashboardService = {
  /**
   * Obtener estadísticas completas para el panel de administración
   */
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
      // Ejecutar consultas en paralelo para mejor rendimiento
      const [
        usersData,
        restaurantsData,
        ordersData,
        salesData,
        recentActivity
      ] = await Promise.all([
        getUserStats(),
        getRestaurantStats(),
        getOrderStats(),
        getRevenueStats(),
        getRecentActivity()
      ]);

      return {
        users: usersData,
        restaurants: restaurantsData,
        orders: ordersData,
        revenue: salesData,
        recentActivity
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del panel:', error);
      throw new Error('Error al cargar los datos del panel de administración');
    }
  }
};

// Obtener estadísticas de usuarios
async function getUserStats() {
  // Obtener todos los usuarios
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Contar usuarios por rol
  const byRole: Record<UserRole, number> = {
    admin: 0,
    restaurant_admin: 0,
    customer: 0,
    delivery_person: 0
  };

  users?.forEach(user => {
    const role = user.role as UserRole;
    if (role && byRole[role] !== undefined) {
      byRole[role]++;
    }
  });

  // Formatear usuarios recientes
  const recentUsers = (users || []).slice(0, 5).map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario',
    email: user.email || '',
    role: user.role as UserRole || 'customer',
    createdAt: user.created_at
  }));

  return {
    total: users?.length || 0,
    byRole,
    recentUsers
  };
}

// Obtener estadísticas de restaurantes
async function getRestaurantStats() {
  // Obtener todos los restaurantes
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, active, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Contar restaurantes activos
  const activeCount = restaurants?.filter(r => r.active).length || 0;

  // Formatear restaurantes recientes
  const recentRestaurants = (restaurants || []).slice(0, 5).map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    createdAt: restaurant.created_at
  }));

  return {
    total: restaurants?.length || 0,
    active: activeCount,
    recentRestaurants
  };
}

// Obtener estadísticas de pedidos
async function getOrderStats() {
  // Obtener todos los pedidos
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, 
      total, 
      status, 
      created_at,
      restaurant_id,
      restaurants:restaurant_id (name),
      user_id,
      users:user_id (first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Contar pedidos por estado
  const byStatus: Record<string, number> = {};
  orders?.forEach(order => {
    const status = order.status || 'unknown';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  // Contar pedidos de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  }).length || 0;

  // Formatear pedidos recientes
  const recentOrders = (orders || []).slice(0, 5).map(order => {
    const user = order.users;
    const restaurant = order.restaurants;
    
    return {
      id: order.id,
      restaurantName: restaurant?.name || 'Restaurante',
      userName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Usuario',
      total: order.total || 0,
      status: order.status || 'unknown',
      createdAt: order.created_at
    };
  });

  return {
    today: todayOrders,
    total: orders?.length || 0,
    byStatus,
    recentOrders
  };
}

// Obtener estadísticas de ingresos
async function getRevenueStats() {
  // Obtener todos los pagos
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, status, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calcular ingresos totales
  const totalRevenue = payments?.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) || 0;

  // Calcular ingresos de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPayments = payments?.filter(payment => {
    const paymentDate = new Date(payment.created_at);
    return paymentDate >= today;
  }) || [];
  
  const todayRevenue = todayPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  // Calcular ingresos de ayer para el porcentaje de cambio
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayPayments = payments?.filter(payment => {
    const paymentDate = new Date(payment.created_at);
    return paymentDate >= yesterday && paymentDate < today;
  }) || [];
  
  const yesterdayRevenue = yesterdayPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  // Calcular porcentaje de cambio
  let changePercentage = 0;
  if (yesterdayRevenue > 0) {
    changePercentage = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  } else if (todayRevenue > 0) {
    changePercentage = 100; // Si ayer fue 0 y hoy hay algo, es un aumento del 100%
  }

  return {
    today: todayRevenue,
    total: totalRevenue,
    changePercentage
  };
}

// Obtener actividad reciente
async function getRecentActivity() {
  // En un sistema real, tendríamos una tabla de actividades o eventos
  // Para esta implementación, usaremos una combinación de pedidos, usuarios y restaurantes recientes
  
  const [
    { data: recentOrders },
    { data: recentUsers },
    { data: recentRestaurants }
  ] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        id, 
        created_at,
        status,
        restaurants:restaurant_id (name),
        users:user_id (first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('users')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('restaurants')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  const activity: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    entityType: string;
    entityId: string;
  }> = [];

  // Añadir actividad de pedidos
  recentOrders?.forEach(order => {
    const restaurant = order.restaurants;
    const user = order.users;
    const restaurantName = restaurant?.name || 'Restaurante';
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Usuario';
    
    let action = 'realizó un pedido';
    if (order.status === 'completed') {
      action = 'completó un pedido';
    } else if (order.status === 'cancelled') {
      action = 'canceló un pedido';
    }

    activity.push({
      id: `order-${order.id}`,
      user: restaurantName,
      action: action,
      time: getTimeAgo(new Date(order.created_at)),
      entityType: 'order',
      entityId: order.id
    });
  });

  // Añadir actividad de usuarios
  recentUsers?.forEach(user => {
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    
    activity.push({
      id: `user-${user.id}`,
      user: userName,
      action: 'se registró como nuevo usuario',
      time: getTimeAgo(new Date(user.created_at)),
      entityType: 'user',
      entityId: user.id
    });
  });

  // Añadir actividad de restaurantes
  recentRestaurants?.forEach(restaurant => {
    activity.push({
      id: `restaurant-${restaurant.id}`,
      user: restaurant.name,
      action: 'se registró como nuevo restaurante',
      time: getTimeAgo(new Date(restaurant.created_at)),
      entityType: 'restaurant',
      entityId: restaurant.id
    });
  });

  // Ordenar por fecha
  return activity.sort((a, b) => {
    const timeA = parseTimeAgo(a.time);
    const timeB = parseTimeAgo(b.time);
    return timeA - timeB;
  });
}

// Función auxiliar para convertir fecha a "tiempo atrás"
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'ahora mismo';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffMins < 1440) { // 24 horas
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else {
    const diffDays = Math.floor(diffMins / 1440);
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }
}

// Función auxiliar para convertir "tiempo atrás" a milisegundos (para ordenar)
function parseTimeAgo(timeAgo: string): number {
  const now = new Date().getTime();
  
  if (timeAgo === 'ahora mismo') {
    return 0;
  }
  
  const parts = timeAgo.split(' ');
  const value = parseInt(parts[0], 10);
  const unit = parts[1];
  
  if (unit.includes('minuto')) {
    return value * 60 * 1000;
  } else if (unit.includes('hora')) {
    return value * 60 * 60 * 1000;
  } else if (unit.includes('día')) {
    return value * 24 * 60 * 60 * 1000;
  }
  
  return 0;
}