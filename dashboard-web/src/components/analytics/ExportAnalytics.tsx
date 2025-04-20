import React, { useState } from 'react';
import { useDictionary } from '@/hooks/useDictionary';

interface ExportAnalyticsProps {
  restaurantId?: string;
}

const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({ restaurantId }) => {
  const dict = useDictionary();
  const [exportType, setExportType] = useState<string>('orders');
  const [dateRange, setDateRange] = useState<string>('last30');
  const [format, setFormat] = useState<string>('csv');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExport = () => {
    setIsLoading(true);
    
    // Simulating export process
    setTimeout(() => {
      setIsLoading(false);
      alert('Export completado. El archivo se ha descargado.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-medium text-gray-800">
          Exportar Datos Analíticos
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Datos
              </label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="orders">Pedidos</option>
                <option value="sales">Ventas</option>
                <option value="customers">Clientes</option>
                <option value="menu">Menú y Productos</option>
                <option value="delivery">Entregas</option>
                <option value="ratings">Calificaciones</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de Fechas
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="last7">Últimos 7 días</option>
                <option value="last30">Últimos 30 días</option>
                <option value="thisMonth">Este mes</option>
                <option value="lastMonth">Mes pasado</option>
                <option value="thisYear">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {dateRange === 'custom' && (
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato de Archivo
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opciones Adicionales
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeHeaders"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="includeHeaders" className="ml-2 block text-sm text-gray-700">
                    Incluir encabezados de columna
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="compressionOption"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="compressionOption" className="ml-2 block text-sm text-gray-700">
                    Comprimir archivo
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700">
                    Enviar por email
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              'Exportar Datos'
            )}
          </button>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Exportaciones Recientes
        </h3>
        
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre de Archivo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tamaño
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  pedidos_abril_2025.csv
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  Pedidos
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  01/04/2025
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  1.2 MB
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <a href="#" className="text-primary hover:text-primary-600">
                    Descargar
                  </a>
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  ventas_q1_2025.xlsx
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  Ventas
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  15/03/2025
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  2.8 MB
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <a href="#" className="text-primary hover:text-primary-600">
                    Descargar
                  </a>
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  clientes_febrero_2025.csv
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  Clientes
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  28/02/2025
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  0.9 MB
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <a href="#" className="text-primary hover:text-primary-600">
                    Descargar
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportAnalytics;