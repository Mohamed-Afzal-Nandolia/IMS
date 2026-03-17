'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LuPackage,
  LuShoppingCart,
  LuUsers,
  LuWarehouse,
  LuFileText,
  LuChevronLeft,
  LuChevronDown,
  LuChevronRight,
  LuBell,
  LuBox,
} from 'react-icons/lu';
import { RxDashboard } from 'react-icons/rx';
import { TbReceiptTax } from 'react-icons/tb';
import { SlBookOpen } from 'react-icons/sl';
import { BsGraphUpArrow } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { useState, useRef } from 'react';
import { Portal } from '@/components/ui/Portal';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  moduleKey?: string;
  children?: { label: string; href: string }[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string || 'default';
  const { enabledModules } = useAuth();
  
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<{ label: string; top: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>(null);

  const dashBasePath = `/${slug}/dashboard`;

  const allNavItems: NavItem[] = [
    { label: 'Dashboard', href: dashBasePath, icon: RxDashboard },
    {
      label: 'Products',
      icon: LuPackage,
      moduleKey: 'PRODUCTS',
      children: [
        { label: 'All Products', href: `${dashBasePath}/products` },
        { label: 'Hierarchy', href: `${dashBasePath}/products/categories` },
        { label: 'Stock Adjust', href: `${dashBasePath}/products/stock-adjust` },
      ],
    },
    {
      label: 'Purchase',
      icon: BiPurchaseTagAlt,
      moduleKey: 'PURCHASES',
      children: [
        { label: 'Invoices', href: `${dashBasePath}/purchases` },
        { label: 'Orders', href: `${dashBasePath}/purchases/orders` },
        { label: 'Returns', href: `${dashBasePath}/purchases/returns` },
      ],
    },
    {
      label: 'Sales',
      icon: LuShoppingCart,
      moduleKey: 'SALES',
      children: [
        { label: 'Invoices', href: `${dashBasePath}/sales` },
        { label: 'Quotations', href: `${dashBasePath}/sales/quotations` },
        { label: 'Sales Returns', href: `${dashBasePath}/sales/returns` },
      ],
    },
    {
      label: 'GST',
      icon: TbReceiptTax,
      moduleKey: 'GST',
      children: [
        { label: 'GST Dashboard', href: `${dashBasePath}/gst` },
        { label: 'GSTR-1', href: `${dashBasePath}/gst/gstr1` },
        { label: 'GSTR-3B', href: `${dashBasePath}/gst/gstr3b` },
      ],
    },
    { label: 'Accounting', href: `${dashBasePath}/accounting`, icon: SlBookOpen, moduleKey: 'ACCOUNTING' },
    { label: 'Inventory', href: `${dashBasePath}/inventory`, icon: LuBox, moduleKey: 'INVENTORY' },
    { label: 'Parties', href: `${dashBasePath}/parties`, icon: LuUsers, moduleKey: 'PARTIES' },
    { label: 'Reports', href: `${dashBasePath}/reports`, icon: BsGraphUpArrow, moduleKey: 'REPORTS' },
    { label: 'Settings', href: `${dashBasePath}/settings`, icon: IoSettingsOutline, moduleKey: 'SETTINGS' },
  ];

  // Show items that have no moduleKey (always visible) OR whose moduleKey is in enabledModules
  const navItems = allNavItems.filter(
    (item) => !item.moduleKey || enabledModules.includes(item.moduleKey)
  );

  const toggleExpand = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  const handleMouseEnter = (item: NavItem, e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredNav({ label: item.label, top: rect.top });
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNav(null);
    }, 150);
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
            <div 
              key={item.label}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            >
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

      {/* Collapsed Tooltip / Menu Popup */}
      <AnimatePresence>
        {collapsed && hoveredNav && (
          <Portal>
            <div
              className="fixed z-[110]"
              style={{ top: hoveredNav.top, left: 72 + 8 }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden',
                  navItems.find((i) => i.label === hoveredNav.label)?.children ? 'w-48 py-2' : 'px-3 py-2'
                )}
              >
                {(() => {
                  const hoveredItem = navItems.find((i) => i.label === hoveredNav.label);
                  if (!hoveredItem) return null;
                  
                  if (hoveredItem.children) {
                    return (
                      <div className="flex flex-col">
                        <div className="px-4 py-1.5 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                          {hoveredItem.label}
                        </div>
                        {hoveredItem.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setHoveredNav(null)}
                            className={cn(
                              'block px-4 py-2 text-sm transition-colors',
                              pathname === child.href
                                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">
                      {hoveredItem.label}
                    </span>
                  );
                })()}
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>

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
