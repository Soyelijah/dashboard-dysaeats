'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/components/ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ThemeProvider>
    </NextThemesProvider>
  );
}