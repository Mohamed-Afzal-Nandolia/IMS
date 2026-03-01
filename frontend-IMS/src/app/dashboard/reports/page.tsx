'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuChartBar, LuLoader, LuTrendingUp, LuPackage, LuUsers, LuFileText, LuDownload, LuCalendar } from 'react-icons/lu';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { useParties } from '@/hooks/useParties';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

// Mock data for the chart
const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
  { name: 'Jul', revenue: 3490, profit: 4300 },
];

export default function ReportsPage() {
  const { data: salesData, isLoading: ls } = useInvoices({ type: 'sale', pageSize: 200 });
  const { data: purchaseData, isLoading: lp } = useInvoices({ type: 'purchase', pageSize: 200 });
  const { data: productsData, isLoading: lprod } = useProducts({ pageSize: 200 });
  const { data: partiesData, isLoading: lpar } = useParties({ pageSize: 200 });
  const isLoading = ls || lp || lprod || lpar;

  const sales = salesData?.invoices || [];
  const purchases = purchaseData?.invoices || [];
  const products = productsData?.products || [];
  const parties = partiesData?.parties || [];

  const totalSales = sales.reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalPurchases = purchases.reduce((s, i) => s + (i.total_amount || 0), 0);
  const lowStock = products.filter((p) => p.current_stock > 0 && p.current_stock < 20);

  const reports = [
    { title: 'Sales Summary', desc: `${sales.length} invoices`, value: formatCurrency(totalSales), icon: LuTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Purchase Summary', desc: `${purchases.length} bills`, value: formatCurrency(totalPurchases), icon: LuFileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Inventory Report', desc: `${products.length} products`, value: `${lowStock.length} low stock`, icon: LuPackage, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Party Ledger', desc: `${parties.length} parties`, value: 'Receivables & payables', icon: LuUsers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Profit & Loss', desc: 'Revenue vs expenses', value: formatCurrency(totalSales - totalPurchases), icon: LuChartBar, color: totalSales >= totalPurchases ? 'text-emerald-600' : 'text-red-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'GST Report', desc: 'Tax summary', value: formatCurrency(sales.reduce((s, i) => s + (i.cgst_amount || 0) + (i.sgst_amount || 0), 0)), icon: LuFileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generated from your business data</p>
      </motion.div>

      {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div> : (
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

      {/* Revenue Chart */}
      {!isLoading && (
        <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 xl:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue vs profit</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LuCalendar className="w-4 h-4 text-gray-500" />
                This Year
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LuDownload className="w-4 h-4 text-gray-500" />
                Export
              </button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
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
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.4)',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
