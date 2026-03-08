'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LuLoader, LuDownload } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

export default function GSTR3BPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { data: salesData, isLoading: loadingSales } = useInvoices({ type: 'sale', pageSize: 200 });
  const { data: purchaseData, isLoading: loadingPurchases } = useInvoices({ type: 'purchase', pageSize: 200 });

  const sales = salesData?.invoices || [];
  const purchases = purchaseData?.invoices || [];
  const isLoading = !isMounted || loadingSales || loadingPurchases;

  const outwardTax = sales.reduce((s, i) => s + (i.cgstAmount || 0) + (i.sgstAmount || 0) + (i.igstAmount || 0), 0);
  const itc = purchases.reduce((s, i) => s + (i.cgstAmount || 0) + (i.sgstAmount || 0) + (i.igstAmount || 0), 0);
  const netTax = Math.max(0, outwardTax - itc);

  const rows = [
    { label: '3.1 Outward Supplies (Taxable)', taxable: sales.reduce((s, i) => s + (i.subtotal || 0), 0), cgst: sales.reduce((s, i) => s + (i.cgstAmount || 0), 0), sgst: sales.reduce((s, i) => s + (i.sgstAmount || 0), 0), igst: sales.reduce((s, i) => s + (i.igstAmount || 0), 0) },
    { label: '4. Eligible ITC', taxable: purchases.reduce((s, i) => s + (i.subtotal || 0), 0), cgst: purchases.reduce((s, i) => s + (i.cgstAmount || 0), 0), sgst: purchases.reduce((s, i) => s + (i.sgstAmount || 0), 0), igst: purchases.reduce((s, i) => s + (i.igstAmount || 0), 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Header — always visible immediately */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">GSTR-3B — Monthly Return</h1><p className="text-sm text-gray-500 mt-1">Summary of outward/inward supplies</p></div>
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50"><LuDownload className="w-4 h-4" /> Export</button>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <LuLoader className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading GSTR-3B data...</p>
        </div>
      ) : (
        <motion.div
          key="gstr3b-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50"><th className="px-5 py-3 font-medium">Description</th><th className="px-5 py-3 text-right font-medium">Taxable Value</th><th className="px-5 py-3 text-right font-medium">CGST</th><th className="px-5 py-3 text-right font-medium">SGST</th><th className="px-5 py-3 text-right font-medium">IGST</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-gray-100/50 dark:border-gray-800 text-gray-700 dark:text-gray-300">
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
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
