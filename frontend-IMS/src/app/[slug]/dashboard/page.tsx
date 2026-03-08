'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  LuTrendingUp, LuShoppingCart, LuPackage, LuUsers, LuIndianRupee,
  LuTriangleAlert, LuLoader, LuArrowUpRight,
} from 'react-icons/lu';
import { useDashboardStats, type TimeRange } from '@/hooks/useDashboard';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Lazy-load recharts — heavy chart library, not needed for initial render
// rule: bundle-dynamic-imports — defers ~200KB of chart code
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// Analytics data is now derived dynamically from useDashboardStats()


const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>('6months');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { data: stats, isLoading } = useDashboardStats(range);

  if (!isMounted || (isLoading && !stats)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <LuLoader className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-500 mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Sales', value: formatCurrency(stats?.totalSales || 0), change: `${stats?.salesCount || 0} invoices`, icon: LuTrendingUp, color: 'bg-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600' },
    { label: 'Total Purchases', value: formatCurrency(stats?.totalPurchases || 0), change: `${stats?.purchasesCount || 0} bills`, icon: LuShoppingCart, color: 'bg-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
    { label: 'Net Profit', value: formatCurrency(stats?.netProfit || 0), change: (stats?.netProfit || 0) >= 0 ? 'Profit' : 'Loss', icon: LuIndianRupee, color: 'bg-indigo-500', iconBg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600' },
    { label: 'Products', value: (stats?.totalProducts || 0).toString(), change: `${stats?.totalParties || 0} parties`, icon: LuPackage, color: 'bg-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here&apos;s your business overview.</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute -top-3 -right-3 w-28 h-28 ${kpi.color} opacity-5 rounded-full`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Analytics Chart */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales & Purchases Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {(range === '7days' || range === '30days') ? 'Daily' : 'Monthly'} performance comparison
            </p>
          </div>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="6months">Last 6 months</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

              <defs>
                <filter id="solidShadow">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500 }}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="sales" name="Sales" stroke="#818cf8" strokeWidth={3} fillOpacity={0.1} fill="#818cf8" />
              <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#34d399" strokeWidth={3} fillOpacity={0.1} fill="#34d399" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Low Stock + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuTriangleAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
            </div>
            <Link href="inventory" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          {(stats?.lowStockItems || []).length === 0 ? (
            <div className="text-center py-10">
              <LuPackage className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">All stock levels are normal</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {(stats?.lowStockItems || []).map((p: any) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-400">Min: {p.minStockLevel} {p.unit}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 tabnum">
                    {p.currentStock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Invoices */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Invoices</h2>
            <Link href="sales" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          {(stats?.recentInvoices || []).length === 0 ? (
            <div className="text-center py-10">
              <LuShoppingCart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">No invoices yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {(stats?.recentInvoices || []).map((inv: any) => (
                <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 capitalize">{inv.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.totalAmount)}</p>
                    <span className={`text-xs font-medium capitalize ${inv.invoice_type === 'sale' ? 'text-emerald-600' : 'text-blue-600'}`}>{inv.invoice_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: 'products', icon: LuPackage, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'New Invoice', href: 'sales', icon: LuTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Add Party', href: 'parties', icon: LuUsers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'View Reports', href: 'reports', icon: LuArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
