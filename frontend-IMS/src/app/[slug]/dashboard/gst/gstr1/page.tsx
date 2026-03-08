'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LuFileText, LuLoader, LuDownload } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

export default function GSTR1Page() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { data, isLoading: loadingData } = useInvoices({ type: 'sale', pageSize: 100 });
  const isLoading = !isMounted || loadingData;

  const invoices = data?.invoices || [];
  const totalTaxable = invoices.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalCGST = invoices.reduce((s, i) => s + (i.cgstAmount || 0), 0);
  const totalSGST = invoices.reduce((s, i) => s + (i.sgstAmount || 0), 0);
  const totalIGST = invoices.reduce((s, i) => s + (i.igstAmount || 0), 0);
  const totalInvoiceValue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header — always visible immediately */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">GSTR-1 — Outward Supplies</h1><p className="text-sm text-gray-500 mt-1">Auto-generated from your sales invoices</p></div>
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"><LuDownload className="w-4 h-4" /> Export</button>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <LuLoader className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading GSTR-1 data...</p>
        </div>
      ) : (
        <motion.div
          key="gstr1-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total Invoices', value: invoices.length.toString(), color: 'text-indigo-600' },
              { label: 'Taxable Value', value: formatCurrency(totalTaxable), color: 'text-gray-900 dark:text-white' },
              { label: 'CGST', value: formatCurrency(totalCGST), color: 'text-blue-600' },
              { label: 'SGST', value: formatCurrency(totalSGST), color: 'text-purple-600' },
              { label: 'Invoice Value', value: formatCurrency(totalInvoiceValue), color: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Invoice table */}
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
            {invoices.length === 0 ? (
              <div className="text-center py-20"><LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No sales invoices for GSTR-1</p><p className="text-sm text-gray-400 mt-1">Create sales invoices to auto-generate this return</p></div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50"><th className="px-5 py-3">Invoice #</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">GSTIN</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Taxable</th><th className="px-5 py-3 text-right">Rate</th><th className="px-5 py-3 text-right">CGST</th><th className="px-5 py-3 text-right">SGST</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
                <tbody>{invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100/50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || 'Cash'}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{inv.party?.gstin || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(inv.subtotal)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {inv.subtotal > 0 ? `${Math.round(((inv.cgstAmount + inv.sgstAmount + inv.igstAmount) / inv.subtotal) * 100)}%` : '0%'}
                    </td>
                    <td className="px-5 py-3 text-right">{formatCurrency(inv.cgstAmount)}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(inv.sgstAmount)}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                  </tr>
                ))}</tbody>
                <tfoot><tr className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
                  <td className="px-5 py-3" colSpan={4}>Total</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(totalTaxable)}</td>
                  <td className="px-5 py-3 text-right"></td>
                  <td className="px-5 py-3 text-right">{formatCurrency(totalCGST)}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(totalSGST)}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(totalInvoiceValue)}</td>
                </tr></tfoot>
              </table></div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
