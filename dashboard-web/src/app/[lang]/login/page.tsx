import { getDictionary } from '@/lib/dictionary';
import LoginForm from '@/components/auth/LoginForm';

interface LoginPageProps {
  params: {
    lang: string;
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Portal</h1>
          <p className="mt-2 text-gray-600">Exclusive access for registered restaurants</p>
        </div>
        
        <LoginForm dict={dict} lang={lang} />
      </div>
    </div>
  );
}