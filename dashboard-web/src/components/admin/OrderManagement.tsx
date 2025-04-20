'use client';

import { useState, useEffect } from 'react';
import OrderManager from './orders/OrderManager';

const OrderManagement = () => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h2 className="text-xl font-semibold mb-4">Gestión de Pedidos</h2>
        <p className="text-gray-600 mb-6">
          Administra todos los pedidos de la plataforma. Puedes ver detalles, cambiar estados y asignar repartidores desde este panel.
        </p>
        
        <OrderManager />
      </div>
    </div>
  );
};

export default OrderManagement;