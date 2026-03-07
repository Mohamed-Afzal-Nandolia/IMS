'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuWarehouse, LuLoader, LuTriangleAlert, LuPackage } from 'react-icons/lu';
import { useProducts } from '@/hooks/useProducts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function InventoryPage() {
  const { data, isLoading } = useProducts({ pageSize: 200 });
  const products = data?.products || [];

  const totalStock = products.reduce((s, p) => s + (p.currentStock || 0), 0);
  const totalValue = products.reduce((s, p) => s + (p.currentStock || 0) * (p.purchasePrice || 0), 0);
  const lowStock = products.filter((p) => (p.currentStock || 0) > 0 && (p.currentStock || 0) < (p.minStockLevel || 20));
  const outOfStock = products.filter((p) => (p.currentStock || 0) === 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Inventory Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Stock levels and inventory valuation</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length.toString(), icon: LuPackage, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Stock Qty', value: totalStock.toLocaleString('en-IN'), icon: LuWarehouse, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Inventory Value', value: formatCurrency(totalValue), icon: LuPackage, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Low Stock Items', value: lowStock.length.toString(), icon: LuTriangleAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {/* Low Stock Table */}
          {lowStock.length > 0 && (
            <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-amber-200 dark:border-amber-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-800/30 flex items-center gap-2">
                <LuTriangleAlert className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Low Stock Alert ({lowStock.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b bg-amber-50/50 dark:bg-amber-900/10"><th className="px-5 py-3">Product</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3 text-center">Current Stock</th><th className="px-5 py-3 text-center">Min Stock</th></tr></thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id} className="border-b border-amber-50 dark:border-amber-900/20">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-3 text-center font-bold text-amber-600 tabnum">{p.currentStock || 0} {p.unit}</td>
                      <td className="px-5 py-3 text-center text-gray-500 tabnum">{p.minStockLevel || 0} {p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Out of Stock Table */}
          {outOfStock.length > 0 && (
            <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-red-200 dark:border-red-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 dark:border-red-800/30 flex items-center gap-2">
                <LuTriangleAlert className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Out of Stock ({outOfStock.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b bg-red-50/50"><th className="px-5 py-3">Product</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Category</th></tr></thead>
                <tbody>
                  {outOfStock.map((p) => (
                    <tr key={p.id} className="border-b border-red-50"><td className="px-5 py-3 font-medium">{p.name}</td><td className="px-5 py-3 text-gray-500">{p.sku}</td><td className="px-5 py-3 text-gray-500">{p.category?.name || '—'}</td></tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* All Stock */}
          <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
            <div className="px-5 py-4 border-b"><h2 className="font-semibold text-gray-900 dark:text-white">All Products Stock</h2></div>
            {products.length === 0 ? <div className="text-center py-12"><p className="text-gray-500">No products. Add products to track inventory.</p></div>
            : <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b bg-gray-50/50"><th className="px-5 py-3">Product</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3 text-center">Stock</th><th className="px-5 py-3 text-right">Value</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.sku}</td>
                    <td className="px-5 py-3 text-center font-semibold tabnum">{p.currentStock || 0} {p.unit}</td>
                    <td className="px-5 py-3 text-right tabnum">{formatCurrency((p.currentStock || 0) * (p.purchasePrice || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
