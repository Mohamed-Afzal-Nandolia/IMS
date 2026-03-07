'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuBookOpen, LuLoader, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function AccountingPage() {
  const { data: salesData, isLoading: ls } = useInvoices({ type: 'sale', pageSize: 200 });
  const { data: purchaseData, isLoading: lp } = useInvoices({ type: 'purchase', pageSize: 200 });
  const isLoading = ls || lp;

  const sales = salesData?.invoices || [];
  const purchases = purchaseData?.invoices || [];

  const revenue = sales.reduce((s, i) => s + (i.subtotal || 0), 0);
  const cogs = purchases.reduce((s, i) => s + (i.subtotal || 0), 0);
  const grossProfit = revenue - cogs;
  const taxCollected = sales.reduce((s, i) => s + (i.cgstAmount || 0) + (i.sgstAmount || 0) + (i.igstAmount || 0), 0);
  const taxPaid = purchases.reduce((s, i) => s + (i.cgstAmount || 0) + (i.sgstAmount || 0) + (i.igstAmount || 0), 0);
  const totalReceivable = sales.reduce((s, i) => s + (i.totalAmount || 0) - (i.amountPaid || 0), 0);
  const totalPayable = purchases.reduce((s, i) => s + (i.totalAmount || 0) - (i.amountPaid || 0), 0);


  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Accounting</h1>
        <p className="text-sm text-gray-500 mt-1">Profit & Loss and key financial metrics</p>
      </motion.div>

      {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div> : (
        <>
          {/* P&L Summary */}
          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: formatCurrency(revenue), color: 'text-emerald-600', icon: LuArrowUpRight },
              { label: 'Cost of Goods', value: formatCurrency(cogs), color: 'text-red-600', icon: LuArrowDownRight },
              { label: 'Gross Profit', value: formatCurrency(grossProfit), color: grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600', icon: LuBookOpen },
              { label: 'Margin', value: revenue > 0 ? `${((grossProfit / revenue) * 100).toFixed(1)}%` : '0%', color: 'text-indigo-600', icon: LuBookOpen },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* P&L Table */}
          <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
            <div className="px-5 py-4 border-b"><h2 className="font-semibold text-gray-900 dark:text-white">Profit & Loss Statement</h2></div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: 'Sales Revenue', value: revenue, bold: true, color: 'text-emerald-600' },
                  { label: 'Cost of Goods Sold', value: -cogs, bold: false, color: 'text-red-600' },
                  { label: 'Gross Profit', value: grossProfit, bold: true, color: grossProfit >= 0 ? 'text-emerald-700' : 'text-red-700', divider: true },
                  { label: 'Tax Collected (Output)', value: taxCollected, bold: false, color: '' },
                  { label: 'Tax Paid (ITC)', value: -taxPaid, bold: false, color: '' },
                  { label: 'Net Tax Liability', value: taxCollected - taxPaid, bold: true, color: 'text-indigo-600', divider: true },
                ].map((row) => (
                  <tr key={row.label} className={`border-b border-gray-50 dark:border-gray-800 ${row.divider ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
                    <td className={`px-5 py-3 ${row.bold ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`}>{row.label}</td>
                    <td className={`px-5 py-3 text-right ${row.bold ? 'font-bold' : 'font-medium'} ${row.color}`}>{formatCurrency(Math.abs(row.value))}{row.value < 0 ? ' (Dr)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Receivables / Payables */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Receivable</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceivable)}</p>
              <p className="text-xs text-gray-400 mt-1">{sales.filter((i) => (i.totalAmount - (i.amountPaid || 0)) > 0).length} unpaid invoices</p>
            </div>
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Payable</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPayable)}</p>
              <p className="text-xs text-gray-400 mt-1">{purchases.filter((i) => (i.totalAmount - (i.amountPaid || 0)) > 0).length} unpaid bills</p>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
