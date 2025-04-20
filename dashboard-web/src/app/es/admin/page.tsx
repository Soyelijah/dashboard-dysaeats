'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Proteger ruta - redirigir si no está autenticado o si no es admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/es/admin/login');
      } else if (user && user.role !== 'admin') {
        // Si el usuario no es admin, redirigir al login de admin
        router.push('/es/admin/login');
      } else {
        // Si está autenticado y es admin, redirigir al panel completo
        router.push('/es/admin/panel');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Mientras verifica autenticación, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex mb-8 bg-neutral-100 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="flex-1">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex-1">
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex-1">
              Menús
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="eventsourcing" className="flex-1">
              Event Sourcing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Dashboard General</h2>
              <p>Bienvenido al panel de administración de DysaEats con Event Sourcing.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-700">Pedidos Totales</h3>
                  <p className="text-2xl mt-2">42</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-semibold text-green-700">Restaurantes</h3>
                  <p className="text-2xl mt-2">8</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-700">Usuarios</h3>
                  <p className="text-2xl mt-2">156</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
              <p className="text-gray-600 mb-4">Esta sección está en desarrollo. Pronto podrás gestionar todos los usuarios desde aquí.</p>
              
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold">Prueba Event Sourcing</p>
                <p className="text-sm mt-2">Puedes probar la funcionalidad de Event Sourcing para usuarios en la pestaña "Event Sourcing".</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Gestión de Restaurantes</h2>
              <p className="text-gray-600 mb-4">Esta sección está en desarrollo. Pronto podrás gestionar todos los restaurantes desde aquí.</p>
              
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold">Prueba Event Sourcing</p>
                <p className="text-sm mt-2">Puedes probar la funcionalidad de Event Sourcing para restaurantes en la pestaña "Event Sourcing".</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Gestión de Menús</h2>
              <p className="text-gray-600 mb-4">Esta sección está en desarrollo. Pronto podrás gestionar todos los menús desde aquí.</p>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Gestión de Pedidos</h2>
              <p className="text-gray-600 mb-4">Esta sección está en desarrollo. Pronto podrás gestionar todos los pedidos desde aquí.</p>
              
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold">Prueba Event Sourcing</p>
                <p className="text-sm mt-2">Puedes probar la funcionalidad de Event Sourcing para pedidos en la pestaña "Event Sourcing".</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="eventsourcing" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Herramientas de Event Sourcing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a 
                  href="/es/event-sourcing" 
                  className="block p-4 border rounded hover:bg-blue-50 transition"
                >
                  <h3 className="font-semibold text-blue-700">Explorador de Event Sourcing</h3>
                  <p className="text-sm mt-2">Crea y visualiza eventos para cualquier tipo de agregado.</p>
                </a>
                
                <a 
                  href="/es/supabase-tables" 
                  className="block p-4 border rounded hover:bg-green-50 transition"
                >
                  <h3 className="font-semibold text-green-700">Explorador de Tablas</h3>
                  <p className="text-sm mt-2">Examina las tablas de la base de datos Supabase.</p>
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}