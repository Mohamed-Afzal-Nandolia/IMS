'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LuLayoutDashboard,
  LuPackage,
  LuShoppingCart,
  LuReceipt,
  LuUsers,
  LuWarehouse,
  LuChartBar,
  LuFileText,
  LuSettings,
  LuIndianRupee,
  LuBookOpen,
  LuChevronLeft,
  LuChevronDown,
  LuChevronRight,
  LuBell,
  LuBox,
} from 'react-icons/lu';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LuLayoutDashboard },
  {
    label: 'Products',
    icon: LuPackage,
    children: [
      { label: 'All Products', href: '/dashboard/products' },
      { label: 'Categories', href: '/dashboard/products/categories' },
      { label: 'Stock Adjust', href: '/dashboard/products/stock-adjust' },
    ],
  },
  {
    label: 'Sales',
    icon: LuShoppingCart,
    children: [
      { label: 'Invoices', href: '/dashboard/sales' },
      { label: 'Quotations', href: '/dashboard/sales/quotations' },
      { label: 'Sales Returns', href: '/dashboard/sales/returns' },
    ],
  },
  {
    label: 'Purchases',
    icon: LuReceipt,
    children: [
      { label: 'Invoices', href: '/dashboard/purchases' },
      { label: 'Orders', href: '/dashboard/purchases/orders' },
      { label: 'Returns', href: '/dashboard/purchases/returns' },
    ],
  },
  { label: 'Parties', href: '/dashboard/parties', icon: LuUsers },
  { label: 'Inventory', href: '/dashboard/inventory', icon: LuBox },
  {
    label: 'GST & Tax',
    icon: LuIndianRupee,
    children: [
      { label: 'GST Dashboard', href: '/dashboard/gst' },
      { label: 'GSTR-1', href: '/dashboard/gst/gstr1' },
      { label: 'GSTR-3B', href: '/dashboard/gst/gstr3b' },
    ],
  },
  { label: 'Accounting', href: '/dashboard/accounting', icon: LuBookOpen },
  { label: 'Reports', href: '/dashboard/reports', icon: LuChartBar },
  { label: 'Settings', href: '/dashboard/settings', icon: LuSettings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <LuBox className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  IMS Pro
                </h1>
                <p className="text-[10px] text-gray-400 -mt-0.5">Inventory & Billing</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = item.href
            ? pathname === item.href
            : item.children?.some((c) => pathname === c.href);
          const isExpanded = expanded === item.label;
          const hasChildren = !!item.children;

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  onClick={() => !collapsed && toggleExpand(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LuChevronDown className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 inset-y-0 my-auto w-1 h-6 bg-indigo-600 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}

              {/* Submenu */}
              <AnimatePresence>
                {hasChildren && isExpanded && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-6 mt-1 space-y-0.5"
                  >
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          pathname === child.href
                            ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10 font-medium'
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            pathname === child.href ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        />
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          {collapsed ? (
            <LuChevronRight className="w-5 h-5" />
          ) : (
            <>
              <LuChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
