'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f

interface LoginFormProps {
  dict: any;
  lang: string;
}

export default function LoginForm({ dict, lang }: LoginFormProps) {
  const router = useRouter();
<<<<<<< HEAD
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

=======
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  // Create a schema for login validation
  const loginSchema = z.object({
    email: z.string().email(dict.auth.invalidFormat),
    password: z.string().min(1, dict.auth.requiredField),
<<<<<<< HEAD
    rememberMe: z.boolean().optional(),
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
<<<<<<< HEAD
    defaultValues: {
      rememberMe: false,
    }
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      setError('');

<<<<<<< HEAD
      // Use the login function from useAuth hook
      await login(data.email, data.password);
      
      // The redirection will be handled by the useEffect above
=======
      // Call your API here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || dict.auth.loginError);
      }

      // Redirect to dashboard on success
      router.push(`/${lang}/dashboard`);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    } catch (err: any) {
      setError(err.message || dict.auth.loginError);
    } finally {
      setIsLoading(false);
    }
  }

<<<<<<< HEAD
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
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
=======
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-md bg-error/10 p-4">
          <div className="text-sm text-error">{error}</div>
        </div>
      )}
      
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
            {dict.auth.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
<<<<<<< HEAD
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-white border"
            placeholder="example@email.com"
=======
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">
              {errors.email.message}
            </p>
          )}
        </div>
        
        <div>
<<<<<<< HEAD
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
=======
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
            {dict.auth.password}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
<<<<<<< HEAD
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-white border"
            placeholder="••••••••"
=======
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
<<<<<<< HEAD
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            {dict.auth.rememberMe}
=======
            id="remember_me"
            name="remember_me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-text-secondary">
            Remember me
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
          </label>
        </div>

        <div className="text-sm">
<<<<<<< HEAD
          <Link 
            href={`/${lang}/forgot-password`} 
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {dict.auth.forgotPassword}
          </Link>
=======
          <a href={`/${lang}/forgot-password`} className="font-medium text-primary hover:text-primary-600">
            {dict.auth.forgotPassword}
          </a>
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
<<<<<<< HEAD
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {dict.common.loading}
            </div>
          ) : (
            dict.auth.login
          )}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {dict.auth.orContinueWith}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 12.151c0 .866-.439 1.687-1.244 2.348-1.369 1.128-3.173 1.31-4.466.781-.724-.293-1.283-.766-1.553-1.311-.235-.475-.267-.95-.103-1.418.165-.468.528-.859 1.023-1.103.496-.244 1.092-.345 1.7-.252.608.092 1.148.335 1.541.695a3.2 3.2 0 11.823 1.508 3.11 3.11 0 01-.013-.248zm10.702-1.451A11.47 11.47 0 0023.25 12a11.509 11.509 0 00-17.068-10.102c-.429.203-.592.725-.363 1.143l.031.056a.75.75 0 001.031.263A9.99 9.99 0 0112 1.75c5.385 0 9.75 4.365 9.75 9.75a9.76 9.76 0 01-.503 3.101l-.017.039a.755.755 0 00.013.06z"></path>
              <path d="M14.956 18.994A5.252 5.252 0 0118.25 14c0-1.11-.346-2.14-.933-2.991l-5.691 10.25c1.03.282 2.107.26 3.13-.065l.201-.088zM5.677 14.647A5.27 5.27 0 014.75 12a5.252 5.252 0 014.728-5.227 5.252 5.252 0 01-3.8-7.021L.75 12.25A11.509 11.509 0 0012 23.25a11.51 11.51 0 005.478-1.381l-8.315-14.95a5.253 5.253 0 01-3.486 7.729z"></path>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.665 16.811a10.316 10.316 0 01-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.609-.249-1.169-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.153-.231-1.725-.75-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 011.73-1.751 4.65 4.65 0 012.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.868-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 001.313.863c-.106.307-.218.6-.336.882z"></path>
              <path d="M15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.54-2.941 1.452a2.955 2.955 0 01-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.437.013.128.019.255.019.382z"></path>
            </svg>
            Apple
          </button>
        </div>
      </div>
=======
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? dict.common.loading : dict.auth.login}
        </button>
      </div>
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    </form>
  );
}