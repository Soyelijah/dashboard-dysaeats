<<<<<<< HEAD
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppHome() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir automáticamente a la página de login para restaurantes
    router.push('/es/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">DysaEats - Portal de Restaurantes</h1>
        <p className="text-lg text-gray-600 mb-8">
          Bienvenido al portal exclusivo para restaurantes
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Redirigiendo al portal de restaurantes...</p>
      </div>
    </div>
  );
=======
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirección en tiempo de renderizado al dashboard
  redirect('/dashboard');
  
  // Este código nunca se ejecutará debido a la redirección, pero es necesario
  // para satisfacer el tipo de retorno de React
  return null;
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
}