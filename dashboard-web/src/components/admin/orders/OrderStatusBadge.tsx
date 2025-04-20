'use client';

import { Clock, Package, Check, Truck, X } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    // Convertir a minúsculas para consistencia (Supabase usa minúsculas)
    const statusLower = status.toLowerCase();
    
    // Mapeo directo a los estados de Supabase
    switch (statusLower) {
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Pendiente'
        };
      case 'preparing':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Package className="h-3 w-3 mr-1" />,
          label: 'En preparación'
        };
      case 'ready':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Check className="h-3 w-3 mr-1" />,
          label: 'Listo'
        };
      case 'in_transit':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <Truck className="h-3 w-3 mr-1" />,
          label: 'En camino'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Check className="h-3 w-3 mr-1" />,
          label: 'Entregado'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <X className="h-3 w-3 mr-1" />,
          label: 'Cancelado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: null,
          label: status
        };
    }
  };

  const { color, icon, label } = getStatusConfig();

  return (
    <span className={`px-2 py-1 inline-flex text-xs items-center leading-5 font-semibold rounded-full ${color} ${className}`}>
      {icon}
      {label}
    </span>
  );
};

export default OrderStatusBadge;