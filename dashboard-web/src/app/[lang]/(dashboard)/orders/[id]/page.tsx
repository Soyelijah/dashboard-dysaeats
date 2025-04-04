'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/hooks/useDictionary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Badge } from '@/components/common/badge';
import { Separator } from '@/components/common/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/select';
import { OrderDetailSkeleton } from '@/components/orders/order-detail-skeleton';
import { OrderTimeline } from '@/components/orders/order-timeline';
import DeliveryMap from '@/components/orders/DeliveryMap';
import { useToast } from '@/hooks/useToast';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import { getOrderById, updateOrderStatus, assignDeliveryPerson } from '@/services/orderService';
import { getAvailableDeliveryPersons } from '@/services/userService';
import { OrderStatus } from '@/types/order';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert';

const OrderDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const dict = useDictionary();
  const { toast } = useToast();
  const [initialOrder, setInitialOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>('');
  
  // Restaurante y ubicacion del pedido (mock data como ejemplo)
  const [restaurantLocation, setRestaurantLocation] = useState<{lat: number; lng: number} | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Usar el hook de socket para orden
  const { order, deliveryLocation: deliveryPersonLocation, isListening, isConnected } = 
    useOrderSocket(params.id, initialOrder);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true);
        const orderData = await getOrderById(params.id);
        setInitialOrder(orderData);
        setSelectedStatus(orderData.status);
        
        if (orderData.deliveryPerson) {
          setSelectedDeliveryPerson(orderData.deliveryPerson.id);
        }
        
        // Obtener coordenadas para el mapa (en un caso real, vendrían del API)
        if (orderData.restaurant?.address?.coordinates) {
          setRestaurantLocation(orderData.restaurant.address.coordinates);
        } else {
          // Datos de ejemplo
          setRestaurantLocation({ lat: -33.447487, lng: -70.673676 });
        }
        
        if (orderData.deliveryAddress?.coordinates) {
          setDeliveryLocation(orderData.deliveryAddress.coordinates);
        } else {
          // Datos de ejemplo (ubicación cercana al restaurante ficticio)
          setDeliveryLocation({ lat: -33.451234, lng: -70.669123 });
        }
        
        // Cargar repartidores disponibles
        const deliveryData = await getAvailableDeliveryPersons();
        setDeliveryPersons(deliveryData);
      } catch (error) {
        console.error('Error cargando detalle del pedido:', error);
        toast({
          title: dict.orders.errorTitle,
          description: dict.orders.errorLoading,
          variant: 'destructive',
        });
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params.id, router, toast, dict]);

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    
    try {
      setIsUpdating(true);
      await updateOrderStatus(params.id, { status: selectedStatus });
      
      toast({
        title: dict.orders.statusUpdated,
        description: dict.orders.statusUpdateSuccess,
      });
      
      // No necesitamos recargar la orden manualmente ya que WebSocket actualizará los datos
      // Pero en caso de que el WebSocket no esté conectado, actualizamos manualmente
      if (!isConnected) {
        const updatedOrder = await getOrderById(params.id);
        setInitialOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: dict.orders.errorTitle,
        description: dict.orders.errorUpdating,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryPerson || selectedDeliveryPerson === order.deliveryPerson?.id) return;
    
    try {
      setIsUpdating(true);
      await assignDeliveryPerson(params.id, { deliveryPersonId: selectedDeliveryPerson });
      
      toast({
        title: dict.orders.deliveryAssigned,
        description: dict.orders.deliveryAssignSuccess,
      });
      
      // No necesitamos recargar la orden manualmente ya que WebSocket actualizará los datos
      // Pero en caso de que el WebSocket no esté conectado, actualizamos manualmente
      if (!isConnected) {
        const updatedOrder = await getOrderById(params.id);
        setInitialOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error asignando repartidor:', error);
      toast({
        title: dict.orders.errorTitle,
        description: dict.orders.errorAssigning,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dict.orders.orderDetail} #{order.orderNumber}
          </h1>
          <p className="text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()} - {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isListening && (
            <div className="hidden md:flex items-center mr-2">
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? dict.orders.socket.connected : dict.orders.socket.disconnected}
              </span>
            </div>
          )}
          <Button onClick={() => router.push('/orders')} variant="outline">
            {dict.common.back}
          </Button>
        </div>
      </div>

      {/* Alerta de conexión en tiempo real */}
      {isListening && (
        <Alert variant={isConnected ? "success" : "warning"} className="mb-4">
          <Info className="size-4" />
          <AlertTitle>
            {isConnected ? dict.orders.realTimeUpdates : dict.orders.socket.reconnecting}
          </AlertTitle>
          <AlertDescription>
            {isConnected 
              ? dict.orders.socket.statusChanged 
              : dict.orders.socket.disconnected}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Información del pedido */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{dict.orders.orderInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado del pedido */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{dict.orders.currentStatus}</span>
                <Badge variant={getStatusVariant(order.status)}>
                  {dict.orders.status[order.status]}
                </Badge>
              </div>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={['delivered', 'cancelled', 'rejected'].includes(order.status)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={dict.orders.selectStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidStatusTransitions(order.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {dict.orders.status[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleStatusChange} 
                  disabled={!selectedStatus || selectedStatus === order.status || isUpdating}
                  loading={isUpdating}
                >
                  {dict.orders.updateStatus}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Asignación de repartidor */}
            <div className="flex flex-col space-y-2">
              <span className="font-medium">{dict.orders.deliveryPerson}</span>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                <Select
                  value={selectedDeliveryPerson}
                  onValueChange={setSelectedDeliveryPerson}
                  disabled={['delivered', 'cancelled', 'rejected'].includes(order.status)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={dict.orders.selectDelivery} />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPersons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleAssignDelivery} 
                  disabled={!selectedDeliveryPerson || selectedDeliveryPerson === order.deliveryPerson?.id || isUpdating}
                  loading={isUpdating}
                >
                  {dict.orders.assignDelivery}
                </Button>
              </div>
              
              {order.deliveryPerson && (
                <p>
                  {dict.orders.currentlyAssigned}: {order.deliveryPerson.firstName} {order.deliveryPerson.lastName}
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Línea de tiempo */}
            <div>
              <h3 className="mb-4 font-medium">{dict.orders.timeline}</h3>
              <OrderTimeline order={order} />
            </div>
          </CardContent>
        </Card>

        {/* Detalles del cliente y resumen */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>{dict.orders.customerInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">{dict.orders.name}:</span> {order.customerName}</p>
              <p><span className="font-medium">{dict.orders.email}:</span> {order.customerEmail}</p>
              <p><span className="font-medium">{dict.orders.phone}:</span> {order.customerPhone}</p>
              
              <Separator />
              
              <div>
                <span className="font-medium">{dict.orders.deliveryAddress}:</span>
                <p>{order.deliveryAddress.street}</p>
                {order.deliveryAddress.unit && <p>{order.deliveryAddress.unit}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p>{order.deliveryAddress.zipCode}</p>
                {order.deliveryAddress.instructions && (
                  <p className="mt-2 text-sm italic">{order.deliveryAddress.instructions}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Resumen del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>{dict.orders.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items del pedido */}
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {item.quantity}x {item.name}
                        </div>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <div className="text-sm text-gray-500">
                            {Object.entries(item.options).map(([key, value]) => (
                              <div key={key}>
                                {key}: {value.toString()}
                              </div>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-sm italic text-gray-500">
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="font-medium">
                        ${(item.totalPrice).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{dict.orders.subtotal}</span>
                    <span>${(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.orders.deliveryFee}</span>
                    <span>${(order.deliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.orders.tax}</span>
                    <span>${(order.tax).toFixed(2)}</span>
                  </div>
                  {order.tip > 0 && (
                    <div className="flex justify-between">
                      <span>{dict.orders.tip}</span>
                      <span>${(order.tip).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{dict.orders.total}</span>
                    <span>${(order.total).toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Método de pago */}
                <div className="pt-2">
                  <span className="font-medium">{dict.orders.paymentMethod}:</span>{' '}
                  <span>{order.paymentMethod}</span>
                </div>

                {/* Notas del pedido */}
                {order.notes && (
                  <div className="pt-2">
                    <span className="font-medium">{dict.orders.notes}:</span>{' '}
                    <p className="mt-1 text-sm italic">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mapa de entrega */}
      {order.status === 'in_delivery' && restaurantLocation && deliveryLocation && (
        <div className="mt-6">
          <DeliveryMap
            restaurantLocation={restaurantLocation}
            deliveryLocation={deliveryLocation}
            deliveryPersonLocation={deliveryPersonLocation}
          />
          
          {deliveryPersonLocation && (
            <p className="text-sm text-gray-500 mt-2">
              {dict.orders.locationUpdatedAt} {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Helpers para la UI
function getStatusVariant(status: OrderStatus) {
  const variants: Record<OrderStatus, string> = {
    pending: 'default',
    confirmed: 'secondary',
    preparing: 'warning',
    ready: 'success',
    in_delivery: 'info',
    delivered: 'success',
    cancelled: 'destructive',
    rejected: 'destructive',
  };
  
  return variants[status] || 'default';
}

function getValidStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['in_delivery', 'cancelled'],
    in_delivery: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    rejected: [],
  };
  
  return transitions[currentStatus] || [];
}

export default OrderDetailPage;