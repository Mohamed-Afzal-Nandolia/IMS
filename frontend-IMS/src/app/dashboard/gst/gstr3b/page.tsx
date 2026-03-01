'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuFileText, LuLoader, LuDownload } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function GSTR3BPage() {
  const { data: salesData, isLoading: loadingSales } = useInvoices({ type: 'sale', pageSize: 200 });
  const { data: purchaseData, isLoading: loadingPurchases } = useInvoices({ type: 'purchase', pageSize: 200 });

  const sales = salesData?.invoices || [];
  const purchases = purchaseData?.invoices || [];
  const isLoading = loadingSales || loadingPurchases;

  const outwardTax = sales.reduce((s, i) => s + (i.cgst_amount || 0) + (i.sgst_amount || 0) + (i.igst_amount || 0), 0);
  const itc = purchases.reduce((s, i) => s + (i.cgst_amount || 0) + (i.sgst_amount || 0) + (i.igst_amount || 0), 0);
  const netTax = Math.max(0, outwardTax - itc);

  const rows = [
    { label: '3.1 Outward Supplies (Taxable)', taxable: sales.reduce((s, i) => s + (i.subtotal || 0), 0), cgst: sales.reduce((s, i) => s + (i.cgst_amount || 0), 0), sgst: sales.reduce((s, i) => s + (i.sgst_amount || 0), 0), igst: sales.reduce((s, i) => s + (i.igst_amount || 0), 0) },
    { label: '4. Eligible ITC', taxable: purchases.reduce((s, i) => s + (i.subtotal || 0), 0), cgst: purchases.reduce((s, i) => s + (i.cgst_amount || 0), 0), sgst: purchases.reduce((s, i) => s + (i.sgst_amount || 0), 0), igst: purchases.reduce((s, i) => s + (i.igst_amount || 0), 0) },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">GSTR-3B — Monthly Return</h1><p className="text-sm text-gray-500 mt-1">Summary of outward/inward supplies</p></div>
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50"><LuDownload className="w-4 h-4" /> Export</button>
      </motion.div>

      {/* Summary */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tax on Outward Supplies', value: formatCurrency(outwardTax), color: 'text-red-600' },
          { label: 'Input Tax Credit (ITC)', value: formatCurrency(itc), color: 'text-emerald-600' },
          { label: 'Net Tax Payable', value: formatCurrency(netTax), color: 'text-indigo-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        : <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b bg-gray-50/50"><th className="px-5 py-3 font-medium">Description</th><th className="px-5 py-3 text-right font-medium">Taxable Value</th><th className="px-5 py-3 text-right font-medium">CGST</th><th className="px-5 py-3 text-right font-medium">SGST</th><th className="px-5 py-3 text-right font-medium">IGST</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-gray-50 dark:border-gray-800">
                <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{r.label}</td>
                <td className="px-5 py-3 text-right">{formatCurrency(r.taxable)}</td>
                <td className="px-5 py-3 text-right">{formatCurrency(r.cgst)}</td>
                <td className="px-5 py-3 text-right">{formatCurrency(r.sgst)}</td>
                <td className="px-5 py-3 text-right">{formatCurrency(r.igst)}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold text-indigo-700 dark:text-indigo-300">
              <td className="px-5 py-3">Net Tax Payable</td>
              <td className="px-5 py-3 text-right">—</td>
              <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, rows[0].cgst - rows[1].cgst))}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, rows[0].sgst - rows[1].sgst))}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, rows[0].igst - rows[1].igst))}</td>
            </tr>
          </tbody>
        </table>}
      </motion.div>
    </motion.div>
  );
}
