'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuChartBar, LuLoader, LuTrendingUp, LuPackage, LuUsers, LuFileText, LuDownload } from 'react-icons/lu';
import dynamic from 'next/dynamic';
import { useProducts } from '@/hooks/useProducts';
import { useParties } from '@/hooks/useParties';
import { useDashboardStats, type TimeRange } from '@/hooks/useDashboard';
import { useState, useEffect } from 'react';
const CategoryDistributionChart = dynamic(() => import('@/components/reports/AnalyticsCharts').then(mod => mod.CategoryDistributionChart), { ssr: false, loading: () => <ChartSkeleton /> });
const TopProductsChart = dynamic(() => import('@/components/reports/AnalyticsCharts').then(mod => mod.TopProductsChart), { ssr: false, loading: () => <ChartSkeleton /> });
const InventoryStatusChart = dynamic(() => import('@/components/reports/AnalyticsCharts').then(mod => mod.InventoryStatusChart), { ssr: false, loading: () => <ChartSkeleton /> });
const CashFlowChart = dynamic(() => import('@/components/reports/AnalyticsCharts').then(mod => mod.CashFlowChart), { ssr: false, loading: () => <ChartSkeleton /> });

// Lazy-load recharts — defers heavy chart library off the initial bundle
// rule: bundle-dynamic-imports
const ReportsChart = dynamic(() => import('@/components/reports/ReportsChart'), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl"><LuLoader className="w-8 h-8 animate-spin text-indigo-500" /></div> });

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function ChartSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
      <LuLoader className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}

// Revenue analytics are now computed dynamically from useDashboardStats()


export default function ReportsPage() {
  const [range, setRange] = useState<TimeRange>('6months');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { data: stats, isLoading: lstats } = useDashboardStats(range);
  const { data: productsData, isLoading: lprod } = useProducts({ pageSize: 200 });
  const { data: partiesData, isLoading: lpar } = useParties({ pageSize: 200 });
  const isCardsLoading = !isMounted || (lstats && !stats) || lprod || lpar;
  const isChartLoading = !isMounted || (lstats && !stats);

  const products = productsData?.products || [];
  const parties = partiesData?.parties || [];
  const salesCount = stats?.salesCount || 0;
  const purchasesCount = stats?.purchasesCount || 0;

  const totalSales = stats?.totalSales || 0;
  const totalPurchases = stats?.totalPurchases || 0;

  const lowStock = products.filter((p) => (p.currentStock || 0) > 0 && (p.currentStock || 0) < 20);

  const reports = [
    { title: 'Sales Summary', desc: `${salesCount} invoices`, value: formatCurrency(totalSales), icon: LuTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Purchase Summary', desc: `${purchasesCount} bills`, value: formatCurrency(totalPurchases), icon: LuFileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Inventory Report', desc: `${products.length} products`, value: `${lowStock.length} low stock`, icon: LuPackage, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Party Ledger', desc: `${parties.length} parties`, value: 'Receivables & payables', icon: LuUsers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Profit & Loss', desc: 'Revenue vs expenses', value: formatCurrency(totalSales - totalPurchases), icon: LuChartBar, color: totalSales >= totalPurchases ? 'text-emerald-600' : 'text-red-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'GST Report', desc: 'Tax summary', value: formatCurrency(stats?.totalSalesTax || 0), icon: LuFileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generated from your business data</p>
      </motion.div>

      {isCardsLoading ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-32">
          <LuLoader className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Generating your business reports...</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <div key={r.title} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 hover:shadow-lg transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}><r.icon className={`w-5 h-5 ${r.color}`} /></div>
                <button className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"><LuDownload className="w-4 h-4 text-gray-400" /></button>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{r.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
              <p className={`text-lg font-bold mt-2 ${r.color}`}>{r.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Revenue Chart (Primary) */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-500 mt-1">
                {(range === '7days' || range === '30days') ? 'Daily' : 'Monthly'} revenue vs profit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as TimeRange)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="6months">Last 6 months</option>
                <option value="thisYear">This Year</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LuDownload className="w-4 h-4 text-gray-500" />
                Export
              </button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {isChartLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
                <LuLoader className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <ReportsChart data={stats?.chartData || []} />
            )}
          </div>
        </motion.div>

        {/* Cash Flow Analysis */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Cash Flow Analysis</h2>
          <p className="text-sm text-gray-500 mb-6">Comparison of total sales and purchases</p>
          <div className="h-[350px] w-full">
            {isChartLoading ? <ChartSkeleton /> : <CashFlowChart data={stats?.chartData || []} />}
          </div>
        </motion.div>

        {/* Inventory Health */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inventory Health</h2>
          <p className="text-sm text-gray-500 mb-6">Stock availability status</p>
          <div className="h-[350px] w-full">
            {isChartLoading ? <ChartSkeleton /> : <InventoryStatusChart data={stats?.inventoryStatusData || []} />}
          </div>
        </motion.div>

        {/* Top Performing Products */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Top Performing Products</h2>
          <p className="text-sm text-gray-500 mb-6">Top 5 products by revenue contribution</p>
          <div className="h-[300px] w-full">
            {isChartLoading ? <ChartSkeleton /> : <TopProductsChart data={stats?.topProducts || []} />}
          </div>
        </motion.div>

        {/* Sales by Category */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sales by Category</h2>
          <p className="text-sm text-gray-500 mb-6">Revenue distribution across categories</p>
          <div className="h-[300px] w-full">
            {isChartLoading ? <ChartSkeleton /> : <CategoryDistributionChart data={stats?.categoryData || []} />}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
