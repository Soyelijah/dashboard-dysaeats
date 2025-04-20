<<<<<<< HEAD
import { ReactNode } from 'react';

interface LangLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  return (
    <div lang={params.lang}>
      {children}
    </div>
=======
import { Inter } from 'next/font/google';
import { getDictionary } from '@/lib/dictionary';
import { ReactNode } from 'react';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: { lang: string };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang}>
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  );
}