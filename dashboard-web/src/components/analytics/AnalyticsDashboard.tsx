import React from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsDashboardProps {
  restaurantId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ restaurantId }) => {
  const dict = useDictionary();
  
  // Simulated data - in a real app, this would come from an API
  const salesData = [
    { name: 'Ene', sales: 4000, orders: 240 },
    { name: 'Feb', sales: 3000, orders: 198 },
    { name: 'Mar', sales: 5000, orders: 281 },
    { name: 'Abr', sales: 2780, orders: 189 },
    { name: 'May', sales: 1890, orders: 142 },
    { name: 'Jun', sales: 2390, orders: 178 },
  ];

  const ordersByStatusData = [
    { name: 'Pendiente', value: 20 },
    { name: 'Preparando', value: 15 },
    { name: 'Listo', value: 10 },
    { name: 'Entregado', value: 120 },
    { name: 'Cancelado', value: 5 },
  ];

  const topDishesData = [
    { name: 'Pizza Margarita', value: 54 },
    { name: 'Hamburguesa Clásica', value: 43 },
    { name: 'Tacos al Pastor', value: 41 },
    { name: 'Sushi Mix', value: 35 },
    { name: 'Pasta Carbonara', value: 29 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Ventas Totales
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">$16,280</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↑ 12%</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Pedidos Totales
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">1,228</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↑ 8%</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Valor Promedio
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">$13.25</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-error">↓ 2%</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Restaurantes Activos
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">28</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↑ 2</span> nuevos
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Ventas a lo largo del tiempo
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#1E90FF" 
                name="Ventas"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10B981" 
                name="Pedidos"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            Pedidos por Estado
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Pedidos" fill="#1E90FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            Platos Más Populares
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDishesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Pedidos" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;