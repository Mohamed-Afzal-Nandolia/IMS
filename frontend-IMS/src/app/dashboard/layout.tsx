'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

      {/* Main content */}
      <main
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        className="min-h-screen hidden lg:block transition-[margin] duration-300 ease-out"
      >
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-4 lg:p-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile main content */}
      <div className="lg:hidden">
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-4"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
