'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuFileText, LuLoader, LuDownload } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function GSTR1Page() {
  const { data, isLoading } = useInvoices({ type: 'sale', pageSize: 100 });
  const invoices = data?.invoices || [];
  const totalTaxable = invoices.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalCGST = invoices.reduce((s, i) => s + (i.cgst_amount || 0), 0);
  const totalSGST = invoices.reduce((s, i) => s + (i.sgst_amount || 0), 0);
  const totalIGST = invoices.reduce((s, i) => s + (i.igst_amount || 0), 0);
  const totalInvoiceValue = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">GSTR-1 — Outward Supplies</h1><p className="text-sm text-gray-500 mt-1">Auto-generated from your sales invoices</p></div>
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"><LuDownload className="w-4 h-4" /> Export</button>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
      </motion.div>

      {/* Invoice table */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        : invoices.length === 0 ? <div className="text-center py-20"><LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No sales invoices for GSTR-1</p><p className="text-sm text-gray-400 mt-1">Create sales invoices to auto-generate this return</p></div>
        : <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b bg-gray-50/50"><th className="px-5 py-3">Invoice #</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">GSTIN</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Taxable</th><th className="px-5 py-3 text-right">CGST</th><th className="px-5 py-3 text-right">SGST</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
          <tbody>{invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-5 py-3 font-semibold text-indigo-600">{inv.invoice_number}</td>
              <td className="px-5 py-3">{inv.party?.name || '—'}</td>
              <td className="px-5 py-3 text-gray-500 font-mono text-xs">{inv.party?.gstin || '—'}</td>
              <td className="px-5 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(inv.subtotal)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(inv.cgst_amount)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(inv.sgst_amount)}</td>
              <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.total_amount)}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr className="bg-gray-50 dark:bg-gray-800/50 font-semibold text-gray-900 dark:text-white">
            <td className="px-5 py-3" colSpan={4}>Total</td>
            <td className="px-5 py-3 text-right">{formatCurrency(totalTaxable)}</td>
            <td className="px-5 py-3 text-right">{formatCurrency(totalCGST)}</td>
            <td className="px-5 py-3 text-right">{formatCurrency(totalSGST)}</td>
            <td className="px-5 py-3 text-right">{formatCurrency(totalInvoiceValue)}</td>
          </tr></tfoot>
        </table></div>}
      </motion.div>
    </motion.div>
  );
}
