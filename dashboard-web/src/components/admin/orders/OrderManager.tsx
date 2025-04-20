'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { verifyAuth } from '@/lib/supabase';
import Loader from '@/components/ui/Loader';
import OrderFilterBar from './OrderFilterBar';
import OrderList from './OrderList';
import OrderDetailDialog from './OrderDetailDialog';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  deliveryAddress: string;
  restaurant: {
    id: string;
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
}

interface OrderManagerProps {
  restaurantId?: string;
}

const OrderManager: React.FC<OrderManagerProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(restaurantId || null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    // If restaurantId is provided, use it
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    } else {
      // Otherwise, fetch restaurants
      fetchRestaurants();
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [selectedRestaurantId, selectedStatus]);

  const fetchRestaurants = async () => {
    try {
      const data = await adminService.getRestaurants();
      setRestaurants(data);
      
      // If we have restaurants and no restaurant is selected, select the first one
      if (data.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Error al cargar los restaurantes');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar autenticación primero
      const isAuthenticated = await verifyAuth();
      
      if (!isAuthenticated) {
        setError('Usuario no autenticado. Por favor inicie sesión.');
        return;
      }
      
      // Si está autenticado, cargar los pedidos
      const data = await adminService.getOrders(
        selectedStatus || undefined,
        selectedRestaurantId || undefined
      );
      
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailDialogOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    return (
      order.id.toLowerCase().includes(lowerQuery) ||
      order.customer.name.toLowerCase().includes(lowerQuery) ||
      order.customer.phone.toLowerCase().includes(lowerQuery) ||
      order.deliveryAddress.toLowerCase().includes(lowerQuery) ||
      order.restaurant.name.toLowerCase().includes(lowerQuery)
    );
  });

  const handleRestaurantChange = (id: string | null) => {
    setSelectedRestaurantId(id);
  };

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };


  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>{error}</p>
          <div className="flex gap-3 mt-3">
            <button 
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
              onClick={fetchOrders}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <OrderFilterBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        restaurantId={selectedRestaurantId}
        onRestaurantChange={!restaurantId ? handleRestaurantChange : undefined}
        restaurants={restaurants}
      />

      {loading && orders.length === 0 ? (
        <Loader />
      ) : (
        <OrderList 
          orders={filteredOrders}
          onViewOrder={handleViewOrder}
        />
      )}

      <OrderDetailDialog 
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        orderId={selectedOrderId}
        onStatusChange={fetchOrders}
      />
    </div>
  );
};

export default OrderManager;