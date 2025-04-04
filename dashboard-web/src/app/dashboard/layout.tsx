import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className={`${inter.className} flex h-screen antialiased`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Contenido de la página */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}