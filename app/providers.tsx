'use client';

import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from './toaster';
import { WeatherThemeProvider } from '@/context/WeatherThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
        <WeatherThemeProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </WeatherThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
