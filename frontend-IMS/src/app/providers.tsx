'use client';

import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';
import { useState } from 'react';
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
      <InsforgeBrowserProvider client={insforge as any} afterSignInUrl="/dashboard">
        <ThemeProvider>
          <BusinessProvider>
            {children}
            <Toaster />
          </BusinessProvider>
        </ThemeProvider>
      </InsforgeBrowserProvider>
    </QueryClientProvider>
  );
}
