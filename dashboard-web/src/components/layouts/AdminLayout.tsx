'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const Loader = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Proteger la ruta - redirigir si no está autenticado o si no es admin
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/es/admin/login');
      } else if (user && user.role !== 'admin') {
        // Si el usuario no es admin, redirigir al login de admin
        router.push('/es/admin/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Mientras verifica autenticación, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (simplificado) */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 fixed inset-y-0 left-0 z-20 overflow-y-auto`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`text-xl font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>DysaEats</h1>
          <button 
            className="text-white hover:text-blue-400"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <a 
                href="/es/admin/panel" 
                className="flex items-center p-3 hover:bg-gray-700"
              >
                <span className="mr-3">📊</span>
                {isSidebarOpen && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a 
                href="/es/event-sourcing" 
                className="flex items-center p-3 hover:bg-gray-700"
              >
                <span className="mr-3">🔄</span>
                {isSidebarOpen && <span>Event Sourcing</span>}
              </a>
            </li>
            <li>
              <a 
                href="/es/supabase-tables" 
                className="flex items-center p-3 hover:bg-gray-700"
              >
                <span className="mr-3">📋</span>
                {isSidebarOpen && <span>Tablas</span>}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Panel de Administración</h2>
          <div className="flex items-center space-x-4">
            <span>{user.email}</span>
            <button
              onClick={() => {
                // Cerrar sesión
                router.push('/es/admin/login');
              }}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Salir
            </button>
          </div>
        </header>
        
        <main className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;