'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { Toaster } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BusinessProvider>
            {children}
            <Toaster />
          </BusinessProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
