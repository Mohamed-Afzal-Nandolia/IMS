'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPackage, LuLoader, LuSearch, LuPlus, LuMinus } from 'react-icons/lu';
import { useProducts } from '@/hooks/useProducts';
import { insforge } from '@/lib/insforge';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function StockAdjustPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ search, pageSize: 50 });
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const products = data?.products || [];

  const handleAdjust = async (productId: string, currentStock: number, adjustment: number) => {
    try {
      setSaving(true);
      const newStock = currentStock + adjustment;
      if (newStock < 0) { addToast({ type: 'warning', title: 'Cannot go below 0' }); return; }
      await insforge.database.from('products').update({ current_stock: newStock }).eq('id', productId);
      const businessId = localStorage.getItem('ims_business_id') || '';
      await insforge.database.from('stock_adjustments').insert({
        business_id: businessId,
        product_id: productId, type: adjustment > 0 ? 'increase' : 'decrease',
        quantity: Math.abs(adjustment), reason: 'Manual adjustment',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setAdjustments((prev) => ({ ...prev, [productId]: 0 }));
      addToast({ type: 'success', title: 'Stock Updated', message: `New stock: ${newStock}` });
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Adjustment</h1><p className="text-sm text-gray-500 mt-1">Increase or decrease stock for your products</p></motion.div>

      <motion.div variants={item} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md">
        <LuSearch className="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20"><LuPackage className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No products found</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b bg-gray-50/50 dark:bg-gray-800/50"><th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">SKU</th><th className="px-5 py-3 font-medium text-center">Current Stock</th><th className="px-5 py-3 font-medium text-center">Adjustment</th><th className="px-5 py-3 font-medium text-center">Action</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-5 py-3 text-center font-semibold">{p.current_stock} {p.unit}</td>
                  <td className="px-5 py-3"><div className="flex items-center justify-center gap-2">
                    <button onClick={() => setAdjustments((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) - 1 }))} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100"><LuMinus className="w-4 h-4" /></button>
                    <input type="number" value={adjustments[p.id] || 0} onChange={(e) => setAdjustments((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))} className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                    <button onClick={() => setAdjustments((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100"><LuPlus className="w-4 h-4" /></button>
                  </div></td>
                  <td className="px-5 py-3 text-center">
                    <button disabled={!adjustments[p.id] || saving} onClick={() => handleAdjust(p.id, p.current_stock, adjustments[p.id] || 0)} className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold disabled:opacity-30 hover:bg-indigo-700">Apply</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}
