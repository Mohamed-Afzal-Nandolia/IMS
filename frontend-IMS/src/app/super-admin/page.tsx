'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LuLoader } from 'react-icons/lu';

function SuperAdminRedirect() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated && role === 'ROLE_SUPER_ADMIN') {
      router.replace('/super-admin/dashboard');
    } else {
      router.replace('/super-admin/login');
    }
  }, [isAuthenticated, role, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <LuLoader className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        <p className="mt-4 text-sm text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="text-center">
                <LuLoader className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="mt-4 text-sm text-gray-500">Loading...</p>
              </div>
            </div>
        }>
            <SuperAdminRedirect />
        </Suspense>
    )
}
