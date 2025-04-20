import { getDictionary } from '@/lib/dictionary';
import RegisterForm from '@/components/auth/RegisterForm_OLD';
import Link from 'next/link';

interface RegisterPageProps {
  params: {
    lang: string;
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Restaurante</h1>
          <p className="mt-2 text-gray-600">Regístrate como restaurante asociado a DysaEats</p>
        </div>
        
        <RegisterForm dict={dict} lang={lang} />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href={`/${lang}/login`} className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}