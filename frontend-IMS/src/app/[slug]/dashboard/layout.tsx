'use client';

import { useState, Suspense, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLoading from './loading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading, businessSlug, role, enabledModules } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Map URL path segments to module keys
  const MODULE_ROUTE_MAP: Record<string, string> = {
    products: 'PRODUCTS',
    sales: 'SALES',
    purchases: 'PURCHASES',
    parties: 'PARTIES',
    inventory: 'INVENTORY',
    gst: 'GST',
    accounting: 'ACCOUNTING',
    reports: 'REPORTS',
    settings: 'SETTINGS',
  };

  useEffect(() => {
    if (isLoading) return;
    
    // Hard check: ensure users are authenticated and not super admins
    if (!isAuthenticated || role === 'ROLE_SUPER_ADMIN') {
      router.replace('/login');
      return;
    }

    // Security check: ensure the URL slug matches the JWT claimed slug
    if (params?.slug && params.slug !== businessSlug) {
      router.replace(`/${businessSlug}/dashboard`);
      return;
    }

    // Module access guard: extract first path segment after /dashboard/
    const dashboardBase = `/${params?.slug}/dashboard`;
    if (pathname && pathname !== dashboardBase) {
      const afterDash = pathname.slice(dashboardBase.length + 1); // e.g. 'products' or 'gst/gstr1'
      const segment = afterDash.split('/')[0];
      const requiredModule = MODULE_ROUTE_MAP[segment];
      if (requiredModule && !enabledModules.includes(requiredModule)) {
        router.replace(dashboardBase);
      }
    }
  }, [isAuthenticated, isLoading, businessSlug, role, params, router, pathname, enabledModules]);

  if (isLoading || !isAuthenticated || (params?.slug && params.slug !== businessSlug)) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            <div className="lg:hidden">
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main content — plain div, no animation, so fixed modals work correctly */}
      <main
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        className="min-h-screen hidden lg:block transition-[margin] duration-300 ease-out"
      >
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <div className="p-4 lg:p-6">
          <Suspense fallback={<DashboardLoading />}>
            {children}
          </Suspense>
        </div>
      </main>

      {/* Mobile main content */}
      <div className="lg:hidden">
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <div className="p-4">
          <Suspense fallback={<DashboardLoading />}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
