'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/es/admin/panel');
    }
  }, [isAuthenticated, router]);
  
  // Force a revalidation of the page to ensure proper loading
  useEffect(() => {
    router.refresh();
  }, [router]);

  // Create a schema for login validation
  const loginSchema = z.object({
    email: z.string().email('El formato del correo electrónico no es válido'),
    password: z.string().min(1, 'Campo requerido'),
    rememberMe: z.boolean().optional(),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      setError('');

      // Use the login function from useAuth hook with isAdminLogin=true
      await login(data.email, data.password, true);
      
      // The redirection will be handled by the useEffect above
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state when checking auth
  if (authLoading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Acceso exclusivo para administradores del sistema</p>
        </div>
        
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 sm:p-4 border border-red-200">
              <div className="flex items-center">
                <svg className="h-4 sm:h-5 w-4 sm:w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 sm:px-4 py-2 sm:py-3 bg-white border text-sm"
                placeholder="admin@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 sm:px-4 py-2 sm:py-3 bg-white border text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-xs sm:text-sm text-gray-700">
                Mantener sesión iniciada
              </label>
            </div>

            <div className="text-xs sm:text-sm">
              <Link 
                href="/es/forgot-password" 
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <div className="flex flex-col space-y-2 text-xs sm:text-sm">
              <Link href="/es/login" className="font-medium text-primary-600 hover:text-primary-500">
                Acceder como restaurante
              </Link>
              <Link href="/es" className="font-medium text-primary-600 hover:text-primary-500">
                Volver a la página principal
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}