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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RestaurantStatsProps {
  restaurantId: string;
}

const COLORS = ['#1E90FF', '#0076CE', '#0056A4', '#003D75', '#002A52'];

const RestaurantStats: React.FC<RestaurantStatsProps> = ({ restaurantId }) => {
  const dict = useDictionary();
  
  // Simulated data for a specific restaurant - in a real app, this would come from an API
  const menuCategoryData = [
    { name: 'Hamburguesas', value: 400 },
    { name: 'Pizzas', value: 300 },
    { name: 'Ensaladas', value: 150 },
    { name: 'Postres', value: 200 },
    { name: 'Bebidas', value: 250 },
  ];

  const weekdayOrdersData = [
    { name: 'Lunes', value: 32 },
    { name: 'Martes', value: 28 },
    { name: 'Miércoles', value: 36 },
    { name: 'Jueves', value: 42 },
    { name: 'Viernes', value: 82 },
    { name: 'Sábado', value: 96 },
    { name: 'Domingo', value: 75 },
  ];

  const hourlyOrdersData = [
    { hour: '12pm', value: 5 },
    { hour: '1pm', value: 25 },
    { hour: '2pm', value: 32 },
    { hour: '3pm', value: 14 },
    { hour: '4pm', value: 7 },
    { hour: '5pm', value: 12 },
    { hour: '6pm', value: 18 },
    { hour: '7pm', value: 36 },
    { hour: '8pm', value: 42 },
    { hour: '9pm', value: 27 },
    { hour: '10pm', value: 14 },
    { hour: '11pm', value: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            Pedidos por Día de la Semana
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Pedidos" fill="#1E90FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            Ventas por Categoría
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={menuCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {menuCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Pedidos por Hora del Día
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyOrdersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Pedidos" fill="#1E90FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Tiempo Promedio de Entrega
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">28 min</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↓ 3 min</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Valor Promedio por Pedido
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">$15.80</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↑ 4%</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Tasa de Cancelación
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">2.4%</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↓ 0.8%</span> vs mes anterior
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">
            Calificación Promedio
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">4.7</p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-success">↑ 0.2</span> vs mes anterior
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantStats;