import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
<<<<<<< HEAD
import '@/styles/globals.css';
=======
import './globals.css';
import Providers from '@/providers';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DysaEats Dashboard',
  description: 'Panel de administración para la plataforma DysaEats',
};

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
=======
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    </html>
  );
}