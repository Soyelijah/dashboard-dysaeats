'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Button } from '@/components/common/button';
import OrderStatusBadge from './OrderStatusBadge';
import { AlertCircle, MapPin, Phone, User, Clock, Check } from 'lucide-react';
import Loader from '@/components/ui/Loader';

// Estados utilizados en la base de datos de Supabase
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listo para entrega' },
  { value: 'in_transit', label: 'En camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

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
  deliveryPerson?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onStatusChange: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  onStatusChange,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Datos de muestra de un pedido
  const mockOrder: Order = {
    id: '1',
    status: 'DELIVERED',
    total: 15000,
    createdAt: '2023-12-15T12:30:00Z',
    items: [
      { id: '1', name: 'Spaghetti Bolognese', price: 12000, quantity: 1, total: 12000 },
      { id: '2', name: 'Tiramisu', price: 3000, quantity: 1, total: 3000 }
    ],
    customer: {
      id: '1',
      name: 'Juan Pérez',
      phone: '+56912345678'
    },
    deliveryAddress: 'Av. Providencia 1234, Providencia',
    restaurant: {
      id: '1',
      name: 'Restaurante Italiano'
    },
    deliveryPerson: {
      id: '1',
      name: 'Pedro Gómez',
      phone: '+56987654321'
    }
  };

  useEffect(() => {
    if (open && orderId) {
      // Cargar detalles reales del pedido
      console.log('Cargando detalles del pedido con ID:', orderId);
      fetchOrderDetails(orderId);
    } else {
      setOrder(null);
      setSelectedStatus('');
    }
  }, [open, orderId]);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('No se pudo cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!order || order.status === selectedStatus) return;
    
    try {
      setChangingStatus(true);
      console.log('Actualizando estado del pedido a:', selectedStatus);
      
      // Llamar a la API de Supabase a través de adminService
      await adminService.updateOrderStatus(order.id, { status: selectedStatus });
      
      // Actualizar localmente después de la actualización exitosa
      setOrder(prev => prev ? {...prev, status: selectedStatus} : null);
      
      // Notificar al componente padre para refrescar la lista
      onStatusChange();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('No se pudo actualizar el estado del pedido');
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido</DialogTitle>
        </DialogHeader>
        
        {loading && <Loader />}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        {order && !loading && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
            </div>
            
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800">Información del Cliente</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{order.customer.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>
              </div>
              
              {/* Restaurant & Delivery Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800">Información del Restaurante</h4>
                <p className="mb-4">{order.restaurant.name}</p>
                
                {order.deliveryPerson ? (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800">Repartidor Asignado</h4>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{order.deliveryPerson.name}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{order.deliveryPerson.phone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay repartidor asignado</p>
                )}
              </div>
            </div>
            
            {/* Status Change */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-800">Cambiar Estado</h4>
              <div className="flex items-center space-x-4">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={handleStatusChange}
                  disabled={changingStatus || order.status === selectedStatus}
                >
                  {changingStatus ? (
                    'Actualizando...'
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Actualizar
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-3 text-gray-800">Elementos del Pedido</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">
                        Total del Pedido
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;