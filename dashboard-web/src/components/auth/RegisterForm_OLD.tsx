'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
// Importamos las utilidades directamente
import validateRUT from '../../utils/validateRUT';
import { formatRUT } from '../../utils/formatRUT';

interface RegisterFormProps {
  dict: any;
  lang: string;
}

export default function RegisterForm({ dict, lang }: RegisterFormProps) {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${lang}/dashboard`);
    }
  }, [isAuthenticated, router, lang]);
  
  // Force a revalidation of the page to ensure proper loading
  useEffect(() => {
    router.refresh();
  }, [router]);

  // Create a schema for registration validation
  const registerSchema = z.object({
    firstName: z.string().min(1, dict.common.requiredField),
    lastName: z.string().min(1, dict.common.requiredField),
    email: z.string()
      .min(1, dict.common.requiredField)
      .email(dict.auth.invalidFormat)
      .refine(val => {
        // Validación adicional de correo electrónico
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(val);
      }, {
        message: 'El formato del correo electrónico no es válido'
      }),
    rut: z.string().min(1, dict.common.requiredField)
      .refine(val => validateRUT(val), {
        message: dict.auth.rutInvalid || 'El RUT ingresado no es válido o no está registrado como restaurante en nuestro sistema. Usa uno de los RUTs de prueba autorizados.'
      }),
    password: z
      .string()
      .min(8, dict.auth.passwordRequirements)
      .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, dict.auth.passwordRequirements || 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número o caracter especial'),
    confirmPassword: z.string().min(1, dict.common.requiredField),
    role: z.enum(['restaurant_admin', 'customer', 'delivery_person']),
    restaurantName: z.string().optional(),
    termsAccepted: z.boolean()
      .refine(val => val === true, {
        message: dict.auth.acceptTermsRequired
      }),
  }).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: dict.auth.passwordsDontMatch,
  }).refine(
    (data) => data.role !== 'restaurant_admin' || (data.role === 'restaurant_admin' && data.restaurantName && data.restaurantName.length > 0),
    {
      path: ['restaurantName'],
      message: dict.common.requiredField,
    }
  );

  type RegisterFormValues = z.infer<typeof registerSchema>;

  // Declarar la función useForm después de definir el schema
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
      termsAccepted: false,
    },
    mode: 'onChange'
  });

  const selectedRole = watch('role');

  async function onSubmit(data: RegisterFormValues) {
    console.log("🟡 [onSubmit] Datos crudos del formulario:", data);
  
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);
  
      // Remover campos no necesarios para el backend
      const { confirmPassword, termsAccepted, ...registerData } = data;
  
      // Normalizar campos
      registerData.rut = formatRUT(registerData.rut);
      registerData.email = registerData.email.trim().toLowerCase();
  
      console.log('🔵 [onSubmit] Datos preparados para enviar al backend (registerUser):', registerData);
  
      // Validación extra por seguridad
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(registerData.email)) {
        throw new Error('El formato del correo electrónico no es válido');
      }
  
      if (!validateRUT(registerData.rut)) {
        throw new Error('El RUT ingresado no es válido');
      }
  
      // Enviar al backend
      const response = await registerUser(registerData);
  
      console.log('🟢 [onSubmit] Respuesta del backend:', response);
  
      setSuccess(true);
      setError('');
      const message = response.message || "Registro exitoso. Confirma tu correo electrónico para iniciar sesión.";
      setSuccessMessage(message);
  
      setTimeout(() => {
        window.location.href = `/${lang}/login?registered=true`;
      }, 2000);
  
    } catch (err: any) {
      console.error('🔴 [onSubmit] Error capturado en onSubmit:', err);
      setError(err.message || dict.auth.registerError);
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
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-error/10 p-4 border border-error/20">
          <div className="flex">
            <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form content goes here... */}
    </form>
  );
}
