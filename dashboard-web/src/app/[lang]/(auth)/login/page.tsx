import { getDictionary } from '@/lib/dictionary';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage({
  params
}: {
  params: { lang: string }
}) {
  const dict = await getDictionary(params.lang);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {dict.common.welcome}
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-text-primary">
            {dict.auth.login}
          </h2>
        </div>
        
        <LoginForm dict={dict} lang={params.lang} />
        
        <div className="text-center mt-4">
          <p className="text-sm text-text-secondary">
            {dict.auth.dontHaveAccount}{' '}
            <a href={`/${params.lang}/register`} className="font-medium text-primary hover:text-primary-600">
              {dict.auth.register}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}