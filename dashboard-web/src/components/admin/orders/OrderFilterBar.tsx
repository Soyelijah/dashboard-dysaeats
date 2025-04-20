'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';

const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PREPARING', label: 'En preparación' },
  { value: 'READY', label: 'Listo para entrega' },
  { value: 'ON_DELIVERY', label: 'En camino' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

interface OrderFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  restaurantId?: string | null;
  onRestaurantChange?: (id: string | null) => void;
  restaurants?: Array<{ id: string; name: string }>;
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  restaurantId,
  onRestaurantChange,
  restaurants = [],
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por ID, cliente o dirección..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Status Filter */}
        <div className="min-w-[200px]">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value || null)}
          >
            <option value="">Todos los estados</option>
            {ORDER_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Restaurant Filter (shown only if onRestaurantChange is provided) */}
        {onRestaurantChange && restaurants.length > 0 && (
          <div className="min-w-[200px]">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={restaurantId || ''}
              onChange={(e) => onRestaurantChange(e.target.value || null)}
            >
              <option value="">Todos los restaurantes</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={() => {
            onSearchChange('');
            onStatusChange(null);
            if (onRestaurantChange) onRestaurantChange(null);
          }}
          disabled={!searchQuery && !selectedStatus && !restaurantId}
        >
          <Filter className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
};

export default OrderFilterBar;