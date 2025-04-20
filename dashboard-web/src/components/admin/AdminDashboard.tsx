'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { verifyAuth } from '@/lib/supabase';
import { ArrowUp, ArrowDown, Users, Store, ShoppingCart, DollarSign } from 'lucide-react';
import Loader from '@/components/ui/Loader';

type DashboardStats = {
  usersCount: number;
  restaurantsCount: number;
  ordersCount: number;
  totalRevenue: number;
};

// Valores iniciales vacíos para el dashboard
const emptyData: DashboardStats = {
  usersCount: 0,
  restaurantsCount: 0,
  ordersCount: 0,
  totalRevenue: 0
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Verificar autenticación antes usando la función centralizada
        const isAuthenticated = await verifyAuth();
        console.log('¿Usuario autenticado?', isAuthenticated);
        
        if (isAuthenticated) {
          try {
            // Intentar obtener estadísticas reales
            const realStats = await adminService.getDashboardStats();
            console.log('Estadísticas obtenidas del servidor:', realStats);
            setStats(realStats);
            setUseMockData(false);
          } catch (err) {
            console.warn('Error al obtener estadísticas reales:', err);
            setError('Error al cargar los datos del dashboard');
          }
        } else {
          console.log('Usuario no autenticado');
          setError('Usuario no autenticado. Por favor inicie sesión.');
        }
      } catch (err: any) {
        console.error('Error general:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p>{error}</p>
        <div className="flex gap-3 mt-3">
          <button 
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Usuarios */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 font-medium mb-1">Usuarios</p>
              <h3 className="text-3xl font-bold">{stats?.usersCount || 0}</h3>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12%</span>
            </div>
            <span className="text-neutral-500 text-sm ml-2">Desde el mes pasado</span>
          </div>
        </div>

        {/* Restaurantes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 font-medium mb-1">Restaurantes</p>
              <h3 className="text-3xl font-bold">{stats?.restaurantsCount || 0}</h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Store className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>8%</span>
            </div>
            <span className="text-neutral-500 text-sm ml-2">Desde el mes pasado</span>
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 font-medium mb-1">Pedidos</p>
              <h3 className="text-3xl font-bold">{stats?.ordersCount || 0}</h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>24%</span>
            </div>
            <span className="text-neutral-500 text-sm ml-2">Desde el mes pasado</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 font-medium mb-1">Ingresos</p>
              <h3 className="text-3xl font-bold">${stats?.totalRevenue || 0}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>18%</span>
            </div>
            <span className="text-neutral-500 text-sm ml-2">Desde el mes pasado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Últimos usuarios registrados</h3>
          {/* Aquí se podrían mostrar los últimos usuarios registrados */}
          <p className="text-neutral-500">Característica en desarrollo</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Restaurantes más populares</h3>
          {/* Aquí se podrían mostrar los restaurantes más populares */}
          <p className="text-neutral-500">Característica en desarrollo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;