import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleString('es-CL')}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Pedidos Hoy', value: '24', change: '+12%', icon: '🛒' },
          { title: 'Ventas Hoy', value: '$152.800', change: '+8%', icon: '💰' },
          { title: 'Nuevos Clientes', value: '5', change: '+2%', icon: '👥' },
          { title: 'Entrega Promedio', value: '28 min', change: '-5%', icon: '🚚' },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p
                  className={`text-xs mt-1 ${
                    card.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {card.change} desde ayer
                </p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Pedidos Recientes</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    {
                      id: '#ORD-001',
                      customer: 'Juan Pérez',
                      total: '$12.500',
                      status: 'Entregado',
                      date: '31/03/2025 14:25',
                    },
                    {
                      id: '#ORD-002',
                      customer: 'María López',
                      total: '$23.800',
                      status: 'En preparación',
                      date: '31/03/2025 15:10',
                    },
                    {
                      id: '#ORD-003',
                      customer: 'Carlos Rodríguez',
                      total: '$18.200',
                      status: 'En camino',
                      date: '31/03/2025 15:45',
                    },
                    {
                      id: '#ORD-004',
                      customer: 'Ana Martínez',
                      total: '$8.900',
                      status: 'Pendiente',
                      date: '31/03/2025 16:05',
                    },
                  ].map((order, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {order.total}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Entregado'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : order.status === 'En camino'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : order.status === 'En preparación'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Actividad Reciente</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[
                {
                  icon: '🛒',
                  title: 'Nuevo pedido recibido',
                  description: 'Pedido #ORD-004 de Ana Martínez',
                  time: 'Hace 5 minutos',
                },
                {
                  icon: '✅',
                  title: 'Pedido completado',
                  description: 'Pedido #ORD-001 entregado con éxito',
                  time: 'Hace 35 minutos',
                },
                {
                  icon: '🚚',
                  title: 'Repartidor asignado',
                  description: 'Diego Flores asignado al pedido #ORD-003',
                  time: 'Hace 15 minutos',
                },
                {
                  icon: '⭐',
                  title: 'Nueva reseña',
                  description: 'Calificación de 5 estrellas recibida',
                  time: 'Hace 1 hora',
                },
                {
                  icon: '🍔',
                  title: 'Menú actualizado',
                  description: 'Se agregaron 3 nuevos productos',
                  time: 'Hace 2 horas',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}