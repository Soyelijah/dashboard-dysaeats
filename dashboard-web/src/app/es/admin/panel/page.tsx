'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { adminDashboardService, AdminDashboardStats } from '@/services/supabase/adminDashboardService';

export default function AdminPanel() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Proteger ruta - redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/es/admin/login');
      } else if (user && user.role !== 'admin') {
        // Si el usuario no es admin, redirigir al login
        router.push('/es/admin/login');
      } else {
        // Si está autenticado y es admin, cargar los datos del dashboard
        loadDashboardData();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);
  
  // Función para cargar los datos del dashboard
  const loadDashboardData = async () => {
    try {
      setIsDataLoading(true);
      const data = await adminDashboardService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/es/admin/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Mostrar cargador mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '#', current: activeSection === 'dashboard' },
    { name: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', href: '#', current: activeSection === 'users' },
    { name: 'Restaurantes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', href: '#', current: activeSection === 'restaurants' },
    { name: 'Categorías', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', href: '#', current: activeSection === 'categories' },
    { name: 'Menú', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', href: '#', current: activeSection === 'menu' },
    { name: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', href: '#', current: activeSection === 'orders' },
    { name: 'Pagos', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', href: '#', current: activeSection === 'payments' },
    { name: 'Repartidores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', href: '#', current: activeSection === 'deliverypeople' },
    { name: 'Event Sourcing', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', href: '/es/event-sourcing', current: activeSection === 'eventsourcing' },
    { name: 'Tablas DB', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', href: '/es/supabase-tables', current: activeSection === 'tables' },
    { name: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', href: '#', current: activeSection === 'settings' },
  ];

  // Función para formatear la moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Estadísticas para el dashboard, usando datos reales o placeholders si aún están cargando
  const stats = [
    { 
      name: 'Total de Usuarios', 
      value: dashboardData ? dashboardData.users.total.toString() : '-', 
      change: '+5%', 
      changeType: 'increase' 
    },
    { 
      name: 'Restaurantes Activos', 
      value: dashboardData ? dashboardData.restaurants.active.toString() : '-', 
      change: '+10%', 
      changeType: 'increase' 
    },
    { 
      name: 'Pedidos Hoy', 
      value: dashboardData ? dashboardData.orders.today.toString() : '-', 
      change: dashboardData && dashboardData.revenue.changePercentage !== 0 
        ? `${dashboardData.revenue.changePercentage > 0 ? '+' : ''}${Math.round(dashboardData.revenue.changePercentage)}%` 
        : '0%', 
      changeType: dashboardData && dashboardData.revenue.changePercentage >= 0 ? 'increase' : 'decrease' 
    },
    { 
      name: 'Ingresos', 
      value: dashboardData ? formatCurrency(dashboardData.revenue.total) : '-', 
      change: dashboardData && dashboardData.revenue.changePercentage !== 0 
        ? `${dashboardData.revenue.changePercentage > 0 ? '+' : ''}${Math.round(dashboardData.revenue.changePercentage)}%` 
        : '0%', 
      changeType: dashboardData && dashboardData.revenue.changePercentage >= 0 ? 'increase' : 'decrease' 
    },
  ];

  // Actividad reciente del sistema, usando datos reales o placeholders si aún están cargando
  const recentActivity = dashboardData 
    ? dashboardData.recentActivity.map((activity, index) => ({
        id: index + 1,
        user: activity.user,
        action: activity.action,
        time: activity.time
      }))
    : [
        { id: 1, user: 'Cargando...', action: 'Cargando...', time: '-' },
      ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${mobileMenuOpen ? 'visible' : 'invisible'}`} role="dialog" aria-modal="true">
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-linear ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-4 pb-3 bg-gradient-to-b from-blue-900 to-blue-800 transition transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center justify-center px-4">
            <div className="flex items-center">
              <img src="/icons/logo-white.svg" alt="DysaEats" className="h-8 w-auto" />
              <span className="ml-2 text-lg font-bold text-white">DysaEats</span>
            </div>
          </div>
          
          <div className="px-4 mt-4">
            <div className="flex items-center px-3 py-2 rounded-md bg-blue-700 bg-opacity-50 mb-4">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600">
                <span className="text-sm font-medium leading-none text-white">{user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}</span>
              </span>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.firstName || user?.email || 'Admin'}</p>
                <p className="text-xs text-blue-200">Administrador</p>
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex-1 h-0 overflow-y-auto px-2">
            <div className="mb-2 px-3">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Menú</span>
            </div>
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                  onClick={() => {
                    if (item.href === '#') {
                      setActiveSection(item.name.toLowerCase());
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <svg
                    className={`${
                      item.current ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Añadir botón de cerrar sesión al menú móvil */}
            <div className="mt-6 px-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="flex-shrink-0 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-700 px-3">
              <div className="flex items-center justify-center text-xs text-blue-200">
                <span>v2.0.1</span>
                <span className="mx-2">•</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:bg-gradient-to-b md:from-blue-900 md:to-blue-800 md:pt-5 md:pb-4 md:w-64">
        <div className="flex items-center justify-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <img src="/icons/logo-white.svg" alt="DysaEats" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-white">DysaEats</span>
          </div>
        </div>
        
        <div className="mt-8 flex-1 flex flex-col overflow-y-auto">
          <div className="px-4">
            <div className="flex items-center px-3 py-2 rounded-md bg-blue-700 bg-opacity-50 mb-4">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600">
                <span className="text-sm font-medium leading-none text-white">{user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}</span>
              </span>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.firstName || user?.email || 'Admin'}</p>
                <p className="text-xs text-blue-200">Administrador</p>
              </div>
            </div>
            
            <div className="space-y-1 px-2 mb-6">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Principal</span>
            </div>
            <nav className="space-y-2 px-2">
              {navigation.slice(0, 3).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => item.href === '#' && setActiveSection(item.name.toLowerCase())}
                >
                  <svg
                    className={`${
                      item.current ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="space-y-1 px-2 pt-6 mb-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Gestión de menú</span>
            </div>
            <nav className="space-y-2 px-2">
              {navigation.slice(3, 5).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => item.href === '#' && setActiveSection(item.name.toLowerCase())}
                >
                  <svg
                    className={`${
                      item.current ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="space-y-1 px-2 pt-6 mb-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Operaciones</span>
            </div>
            <nav className="space-y-2 px-2">
              {navigation.slice(5, 7).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => item.href === '#' && setActiveSection(item.name.toLowerCase())}
                >
                  <svg
                    className={`${
                      item.current ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="space-y-1 px-2 pt-6 mb-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Sistema</span>
            </div>
            <nav className="space-y-2 px-2">
              {navigation.slice(7).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => item.href === '#' && setActiveSection(item.name.toLowerCase())}
                >
                  <svg
                    className={`${
                      item.current ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-150"
            >
              <svg className="flex-shrink-0 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
            <div className="mt-4 flex items-center text-xs text-blue-200 justify-center">
              <span>v2.0.1</span>
              <span className="mx-2">•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col flex-grow">
        <div className="max-w-7xl mx-auto flex flex-col flex-grow w-full px-2 sm:px-0">
          {/* Top header */}
          <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white shadow-sm flex">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Abrir menú</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1 flex justify-between px-4 md:px-6">
              <div className="flex-1 flex items-center">
                {/* Breadcrumbs */}
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <span>DysaEats</span>
                  <svg className="mx-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-900">
                    {activeSection === 'dashboard' ? 'Dashboard' : 
                     activeSection === 'users' ? 'Usuarios' :
                     activeSection === 'restaurants' ? 'Restaurantes' :
                     activeSection === 'categories' ? 'Categorías' :
                     activeSection === 'menu' ? 'Menú' :
                     activeSection === 'orders' ? 'Pedidos' :
                     activeSection === 'payments' ? 'Pagos' :
                     activeSection === 'deliverypeople' ? 'Repartidores' :
                     activeSection === 'settings' ? 'Configuración' :
                     'Panel'}
                  </span>
                </div>
                
                {/* Search field */}
                <div className="max-w-lg w-full ml-0 md:ml-8">
                  <label htmlFor="search-field" className="sr-only">Buscar</label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="search-field"
                      name="search-field"
                      className="hidden md:block w-full h-9 pl-10 pr-3 py-2 border-0 rounded-lg bg-gray-100 text-sm text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Buscar en el panel de administración"
                      type="search"
                    />
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center gap-4">
                {/* Help button */}
                <button className="hidden md:flex items-center text-sm text-gray-500 hover:text-gray-700">
                  <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ayuda</span>
                </button>
                
                {/* Notification bell */}
                <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Ver notificaciones</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification badge */}
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">3</span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                      id="user-menu-button"
                    >
                      <span className="sr-only">Abrir menú de usuario</span>
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 border-2 border-white shadow">
                        <span className="text-sm font-medium leading-none text-white">{user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 flex flex-col">
            {/* Page header */}
            <div className="bg-white shadow">
              <div className="px-3 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
                <div className="py-4 sm:py-6 md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold leading-7 text-gray-900 md:text-3xl sm:truncate">
                      {activeSection === 'dashboard' ? 'Dashboard' : 
                       activeSection === 'users' ? 'Gestión de Usuarios' :
                       activeSection === 'restaurants' ? 'Gestión de Restaurantes' :
                       activeSection === 'categories' ? 'Categorías de Menú' :
                       activeSection === 'menu' ? 'Gestión de Menú' :
                       activeSection === 'orders' ? 'Gestión de Pedidos' :
                       activeSection === 'payments' ? 'Gestión de Pagos' :
                       activeSection === 'deliverypeople' ? 'Repartidores' :
                       activeSection === 'settings' ? 'Configuración' :
                       'Panel de Control'}
                    </h1>
                  </div>
                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row md:mt-0 md:ml-4">
                    {/* Botones contextuales según la sección activa */}
                    {activeSection === 'dashboard' && (
                      <button
                        type="button"
                        className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Exportar Datos
                      </button>
                    )}
                    
                    {(activeSection === 'users' || activeSection === 'restaurants' || 
                      activeSection === 'categories' || activeSection === 'menu' || 
                      activeSection === 'deliverypeople') && (
                      <>
                        <button
                          type="button"
                          className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                          Filtrar
                        </button>
                        <button
                          type="button"
                          className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-3 inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Añadir Nuevo
                        </button>
                      </>
                    )}
                    
                    {(activeSection === 'orders' || activeSection === 'payments') && (
                      <>
                        <button
                          type="button"
                          className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Por Fecha
                        </button>
                        <button
                          type="button"
                          className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-3 inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Exportar
                        </button>
                      </>
                    )}
                    
                    {activeSection === 'settings' && (
                      <button
                        type="button"
                        className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Configuración
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contenido condicional basado en la sección activa */}
            {activeSection === 'dashboard' && (
              <>
                {/* Stats */}
                <div className="mt-6 sm:mt-8">
                  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Resumen</h2>
                      {isDataLoading && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Actualizando datos...
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {stats.map((stat) => (
                        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 sm:p-3">
                                <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div className="ml-3 sm:ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                  <dd>
                                    <div className="text-base sm:text-lg font-medium text-gray-900">{stat.value}</div>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
                            <div className="text-xs sm:text-sm">
                              <span className={`font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                              </span>{' '}
                              <span className="text-gray-500">vs. día anterior</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="mt-6 sm:mt-8">
                  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h2>
                      {isDataLoading && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cargando actividad...
                        </div>
                      )}
                    </div>
                    
                    {/* Responsive table for larger screens */}
                    <div className="mt-2 hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-2 sm:py-3.5 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Usuario</th>
                            <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">Acción</th>
                            <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">Tiempo</th>
                            <th scope="col" className="relative py-2 sm:py-3.5 pl-2 sm:pl-3 pr-3 sm:pr-6">
                              <span className="sr-only">Ver</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                              <tr key={activity.id}>
                                <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-medium text-gray-900">{activity.user}</td>
                                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">{activity.action}</td>
                                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">Hace {activity.time}</td>
                                <td className="relative whitespace-nowrap py-3 sm:py-4 pl-2 sm:pl-3 pr-3 sm:pr-6 text-right text-xs sm:text-sm font-medium">
                                  <a href="#" className="text-blue-600 hover:text-blue-900">Ver<span className="sr-only">, {activity.user}</span></a>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                                No hay actividad reciente para mostrar
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Card-style list for mobile */}
                    <div className="mt-2 sm:hidden space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="bg-white shadow overflow-hidden rounded-lg">
                            <div className="px-4 py-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-xs text-gray-900">{activity.user}</div>
                                <div className="text-xs text-gray-500">Hace {activity.time}</div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">{activity.action}</div>
                              <div className="mt-3 flex justify-end">
                                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-900">Ver</a>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white shadow overflow-hidden rounded-lg p-4 text-center text-xs text-gray-500">
                          No hay actividad reciente para mostrar
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Secciones alternativas */}
            {activeSection !== 'dashboard' && (
              <div className="mt-6 sm:mt-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                  {/* Esta sección se mostrará para todas las vistas que no sean el dashboard */}
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Esta sección está en desarrollo. Los datos reales estarán disponibles pronto.
                          </p>
                          <div className="mt-6">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => {
                                // En una implementación real, aquí cargaríamos los datos específicos de esta sección
                                alert('Función en desarrollo');
                              }}
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Cargar datos de muestra
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </main>
          
          {/* Admin Control Footer - Acceso Rápido y Controles */}
          <footer className="bg-white border-t border-gray-200 mt-auto w-full">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <span className="bg-green-100 px-2 py-1 rounded-md flex items-center text-xs text-green-800 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                      Sistema en línea
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Último acceso: {new Date().toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-150">
                    <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendario
                  </button>
                  <button className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-150">
                    <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Mensajes
                  </button>
                  <button className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-150">
                    <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archivos
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-blue-50 rounded p-3 border border-blue-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-500 p-1 rounded text-white">
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="ml-2 font-semibold text-blue-800">Operaciones</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <a href="#" onClick={() => setActiveSection('dashboard')} className="text-blue-700 hover:text-blue-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </a>
                    <a href="#" onClick={() => setActiveSection('orders')} className="text-blue-700 hover:text-blue-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Pedidos
                    </a>
                    <a href="#" onClick={() => setActiveSection('restaurants')} className="text-blue-700 hover:text-blue-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Restaurantes
                    </a>
                    <a href="#" onClick={() => setActiveSection('deliverypeople')} className="text-blue-700 hover:text-blue-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Repartidores
                    </a>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded p-3 border border-indigo-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-indigo-500 p-1 rounded text-white">
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="ml-2 font-semibold text-indigo-800">Administración</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <a href="#" onClick={() => setActiveSection('users')} className="text-indigo-700 hover:text-indigo-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Usuarios
                    </a>
                    <a href="#" onClick={() => setActiveSection('payments')} className="text-indigo-700 hover:text-indigo-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Finanzas
                    </a>
                    <a href="#" onClick={() => setActiveSection('reports')} className="text-indigo-700 hover:text-indigo-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reportes
                    </a>
                    <a href="#" onClick={() => setActiveSection('settings')} className="text-indigo-700 hover:text-indigo-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Configuración
                    </a>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded p-3 border border-green-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-500 p-1 rounded text-white">
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="ml-2 font-semibold text-green-800">Analítica</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <a href="#" className="text-green-700 hover:text-green-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      KPI Negocios
                    </a>
                    <a href="#" className="text-green-700 hover:text-green-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Proyecciones
                    </a>
                    <a href="#" className="text-green-700 hover:text-green-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tendencias
                    </a>
                    <a href="#" className="text-green-700 hover:text-green-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Exportar
                    </a>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded p-3 border border-purple-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-500 p-1 rounded text-white">
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span className="ml-2 font-semibold text-purple-800">Desarrollo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <a href="/es/event-sourcing" className="text-purple-700 hover:text-purple-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Event Sourcing
                    </a>
                    <a href="/es/supabase-tables" className="text-purple-700 hover:text-purple-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Tablas DB
                    </a>
                    <a href="#" className="text-purple-700 hover:text-purple-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      API Keys
                    </a>
                    <a href="#" className="text-purple-700 hover:text-purple-900 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Logs Sistema
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
                <div>
                  <span>© {new Date().getFullYear()} DysaEats</span>
                  <span className="mx-2">•</span>
                  <span>Versión 2.1.0</span>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span>Uso exclusivo personal autorizado</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-400 hover:text-blue-600 cursor-pointer">Políticas de uso</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}