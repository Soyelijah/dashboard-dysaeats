'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/es/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar cierre de sesión limpiando cookies manualmente
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/es/login';
    }
  };

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        router.push('/es/login');
      } 
      // En este caso todos los usuarios registrados son restaurantes, así que no 
      // necesitamos validación adicional de rol
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white shadow rounded-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard de Restaurante</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {isAuthenticated && user ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-4 sm:px-6 bg-indigo-50">
                    <h3 className="text-base sm:text-lg font-medium leading-6 text-indigo-800">Información de Usuario</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-4 sm:p-6">
                    <dl className="space-y-2 sm:space-y-3">
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Nombre</dt>
                        <dd className="mt-1 text-xs sm:text-sm text-gray-900">{user.firstName} {user.lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-xs sm:text-sm text-gray-900 break-words">{user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Rol</dt>
                        <dd className="mt-1 text-xs sm:text-sm text-gray-900 capitalize">{user.role}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Widget de Estadísticas */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-4 sm:px-6 bg-green-50">
                    <h3 className="text-base sm:text-lg font-medium leading-6 text-green-800">Estadísticas</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-4 sm:p-6">
                    <dl className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Pedidos totales</dt>
                        <dd className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">0</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Pedidos pendientes</dt>
                        <dd className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">0</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Widget de Acciones */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-4 sm:px-6 bg-blue-50">
                    <h3 className="text-base sm:text-lg font-medium leading-6 text-blue-800">Acciones</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center">
                        Ver Pedidos
                      </button>
                      <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full justify-center">
                        Nuevo Pedido
                      </button>
                      <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center">
                        Configuración
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                  <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-800">Actividad Reciente</h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-6 sm:py-8 text-center text-gray-500 italic text-sm sm:text-base">
                    No hay actividad reciente
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-gray-500">Debes iniciar sesión para ver el dashboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}