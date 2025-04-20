import Link from 'next/link';

interface LangHomePageProps {
  params: {
    lang: string;
  };
}

export default function LangHomePage({ params }: LangHomePageProps) {
  const { lang } = params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">
          DysaEats ({lang === 'es' ? 'Español' : 'English'})
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {lang === 'es' 
            ? 'Esta página usa el App Router con internacionalización' 
            : 'This page uses App Router with internationalization'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/${lang}/login`} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            {lang === 'es' ? 'Iniciar sesión' : 'Login'}
          </Link>
          <Link 
            href={`/${lang === 'es' ? 'en' : 'es'}`}
            className="px-6 py-3 border border-gray-300 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            {lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          </Link>
        </div>
      </div>
    </div>
  );
}