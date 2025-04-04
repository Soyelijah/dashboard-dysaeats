// dashboard-web/src/components/orders/OrderStatusBadge.tsx
import React from 'react';
import { Badge } from '../ui/badge';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', variant: 'default' };
      case 'confirmed':
        return { label: 'Confirmado', variant: 'secondary' };
      case 'preparing':
        return { label: 'Preparando', variant: 'warning' };
      case 'ready':
        return { label: 'Listo', variant: 'success' };
      case 'in_delivery':
        return { label: 'En camino', variant: 'info' };
      case 'delivered':
        return { label: 'Entregado', variant: 'success' };
      case 'cancelled':
        return { label: 'Cancelado', variant: 'destructive' };
      case 'rejected':
        return { label: 'Rechazado', variant: 'destructive' };
      default:
        return { label: 'Desconocido', variant: 'default' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant as any}>{config.label}</Badge>
  );
};