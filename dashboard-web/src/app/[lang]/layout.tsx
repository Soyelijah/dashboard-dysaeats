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
  );
}