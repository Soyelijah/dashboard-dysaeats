'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatRUT } from '@/utils/formatRUT';
import validateRUT from '@/utils/validateRUT';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('restaurant_admin');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log('📤 Envío del formulario:');
    console.log({
      firstName,
      lastName,
      email,
      rut,
      password,
      confirmPassword,
      termsAccepted,
      role,
    });
  
    // Validaciones básicas
    if (!firstName || !lastName) {
      setError('Debes ingresar nombre y apellido');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
  
    if (!validateRUT(rut)) {
      setError('El RUT ingresado no es válido. Verifica el dígito verificador.');
      return;
    }
  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('El formato del correo electrónico no es válido');
      return;
    }
    
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
  
    try {
      setIsLoading(true);
      setError('');
  
      const cleanEmail = email.trim().toLowerCase();
      const formattedRUT = formatRUT(rut);
      
      if (!validateRUT(formattedRUT)) {
        setError('El RUT ingresado no es válido, verifica el dígito verificador');
        setIsLoading(false);
        return;
      }
  
      const registerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        rut: formattedRUT,
        password,
        role: 'restaurant_admin',
        phone: '',      
        address: '',    
      };           
  
      console.log('📦 Datos formateados enviados al backend:', registerData);
  
      const response = await registerUser(registerData);
  
      console.log('✅ Respuesta del backend:', response);
      setSuccess(true);
      setError(''); // Limpiar cualquier error previo
  
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('registeredEmail', cleanEmail);
      }
  
      // Mostrar mensaje por más tiempo
      setTimeout(() => {
        router.push('/es/login?registered=true');
      }, 3000);
  
    } catch (err: any) {
      console.error('❌ Error al registrarse:', err);
  
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Error al registrarse';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Restaurante</h1>
          <p className="mt-2 text-gray-600">Regístrate como restaurante asociado a DysaEats</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Registro exitoso! Redirigiendo al login...</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tipo de cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registro para Restaurantes
              </label>
              <div className="flex items-center p-4 rounded-lg border bg-blue-50 border-blue-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Portal exclusivo para restaurantes</p>
                  <p className="text-xs text-blue-600 mt-1">Este portal es exclusivo para negocios que ofrecen servicios de restaurante en DysaEats</p>
                </div>
              </div>
              {/* Role input oculto, siempre restaurant_admin */}
              <input
                type="hidden"
                name="role"
                value="restaurant_admin"
              />
            </div>

            {/* Nombre y apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="Juan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email y RUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                  RUT
                </label>
                <input
                  id="rut"
                  type="text"
                  required
                  value={rut}
                  onChange={(e) => {
                    // Mejor manejo del formato RUT
                    const rawValue = e.target.value.replace(/[^0-9kK]/gi, '');
                    const formatted = formatRUT(rawValue);
                    setRut(formatted);
                  }}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="Ej: 12.345.678-9"
                />
              </div>
            </div>
            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Acepto los <a href="#" className="text-indigo-600 hover:text-indigo-500">términos y condiciones</a>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                isLoading || success
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </div>
              ) : success ? (
                <div className="flex items-center">
                  <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Redirigiendo...
                </div>
              ) : (
                "Registrarse"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/es/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}