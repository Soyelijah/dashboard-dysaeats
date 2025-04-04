'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface LoginFormProps {
  dict: any;
  lang: string;
}

export default function LoginForm({ dict, lang }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Create a schema for login validation
  const loginSchema = z.object({
    email: z.string().email(dict.auth.invalidFormat),
    password: z.string().min(1, dict.auth.requiredField),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      setError('');

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
    } catch (err: any) {
      setError(err.message || dict.auth.loginError);
    } finally {
      setIsLoading(false);
    }
  }

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
            {dict.auth.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">
              {errors.email.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
            {dict.auth.password}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
            id="remember_me"
            name="remember_me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-text-secondary">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href={`/${lang}/forgot-password`} className="font-medium text-primary hover:text-primary-600">
            {dict.auth.forgotPassword}
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? dict.common.loading : dict.auth.login}
        </button>
      </div>
    </form>
  );
}