'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDictionary } from '@/lib/dictionary'; 

interface DashboardPageProps {
  params: {
    lang: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = params;
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>({});
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
    // Load dictionary asynchronously
    const loadDictionary = async () => {
      try {
        const dictionary = await getDictionary(lang);
        setDict(dictionary);
      } catch (error) {
        console.error('Error loading dictionary:', error);
      }
    };
    
    loadDictionary();
  }, [lang]);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, isLoading, router, lang]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${lang}/login`);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar cierre de sesión limpiando cookies manualmente
      if (isClient) {
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.href = `/${lang}/login`;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {dict?.navigation?.dashboard || 'Restaurant Dashboard'}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {dict?.auth?.logout || 'Logout'}
            </button>
          </div>
          
          {isAuthenticated && user ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                    <h3 className="text-lg font-medium leading-6 text-indigo-800">
                      {dict?.settings?.profile || 'User Information'}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          {`${dict?.auth?.firstName || 'First Name'} ${dict?.auth?.lastName || 'Last Name'}`}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.firstName} {user.lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          {dict?.auth?.email || 'Email'}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          {dict?.auth?.accountType || 'Role'}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Widget de Estadísticas */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-green-50">
                    <h3 className="text-lg font-medium leading-6 text-green-800">
                      {dict?.analytics?.title || 'Statistics'}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <dl className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-sm font-medium text-gray-500">
                          {dict?.analytics?.totalOrders || 'Total Orders'}
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-sm font-medium text-gray-500">
                          {dict?.orders?.status?.pending || 'Pending Orders'}
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Widget de Acciones */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-blue-50">
                    <h3 className="text-lg font-medium leading-6 text-blue-800">
                      {dict?.common?.actions || 'Actions'}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="space-y-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center">
                        {dict?.navigation?.orders || 'View Orders'}
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full justify-center">
                        {dict?.menu?.title || 'Manage Menu'}
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center">
                        {dict?.settings?.title || 'Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-800">
                    {dict?.common?.recentActivity || 'Recent Activity'}
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-8 text-center text-gray-500 italic">
                    {dict?.common?.noData || 'No recent activity found'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {dict?.common?.loginRequired || 'You must be logged in to view the dashboard'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}