'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuIndianRupee, LuLoader, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';
import { useInvoices } from '@/hooks/useInvoices';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function GSTPage() {
  const { data: salesData, isLoading: ls } = useInvoices({ type: 'sale', pageSize: 200 });
  const { data: purchaseData, isLoading: lp } = useInvoices({ type: 'purchase', pageSize: 200 });
  const isLoading = ls || lp;

  const sales = salesData?.invoices || [];
  const purchases = purchaseData?.invoices || [];

  const totalSalesCGST = sales.reduce((s, i) => s + (i.cgstAmount || 0), 0);
  const totalSalesSGST = sales.reduce((s, i) => s + (i.sgstAmount || 0), 0);
  const totalSalesIGST = sales.reduce((s, i) => s + (i.igstAmount || 0), 0);
  const totalSalesTax = totalSalesCGST + totalSalesSGST + totalSalesIGST;

  const totalPurchaseCGST = purchases.reduce((s, i) => s + (i.cgstAmount || 0), 0);
  const totalPurchaseSGST = purchases.reduce((s, i) => s + (i.sgstAmount || 0), 0);
  const totalPurchaseIGST = purchases.reduce((s, i) => s + (i.igstAmount || 0), 0);
  const totalITC = totalPurchaseCGST + totalPurchaseSGST + totalPurchaseIGST;

  const netPayable = Math.max(0, totalSalesTax - totalITC);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">GST Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Tax overview computed from your invoices</p>
      </motion.div>

      {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div> : (
        <>
          {/* Summary */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
              <div className="flex items-center gap-2 mb-2"><LuArrowUpRight className="w-5 h-5 text-red-500" /><span className="text-sm text-gray-500">Output Tax (on Sales)</span></div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSalesTax)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
              <div className="flex items-center gap-2 mb-2"><LuArrowDownRight className="w-5 h-5 text-emerald-500" /><span className="text-sm text-gray-500">Input Tax Credit (on Purchases)</span></div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalITC)}</p>
            </div>
            <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <div className="flex items-center gap-2 mb-2"><LuIndianRupee className="w-5 h-5" /><span className="text-sm opacity-80">Net GST Payable</span></div>
              <p className="text-2xl font-bold">{formatCurrency(netPayable)}</p>
            </div>
          </motion.div>

          {/* Breakdown */}
          <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden text-gray-900 dark:text-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800"><h2 className="font-semibold text-gray-900 dark:text-white">Tax Breakdown</h2></div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"><th className="px-5 py-3">Component</th><th className="px-5 py-3 text-right">CGST</th><th className="px-5 py-3 text-right">SGST</th><th className="px-5 py-3 text-right">IGST</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
              <tbody>
                <tr className="border-b border-gray-100/50 dark:border-gray-800">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">Output Tax (Sales)</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(totalSalesCGST)}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(totalSalesSGST)}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(totalSalesIGST)}</td>
                    <td className="px-5 py-3 text-right font-bold text-indigo-600">{formatCurrency(totalSalesTax)}</td>
                </tr>
                <tr className="border-b border-gray-100/50 dark:border-gray-800 text-gray-700 dark:text-gray-300"><td className="px-5 py-3 font-medium">Input Credit</td><td className="px-5 py-3 text-right">{formatCurrency(totalPurchaseCGST)}</td><td className="px-5 py-3 text-right">{formatCurrency(totalPurchaseSGST)}</td><td className="px-5 py-3 text-right">{formatCurrency(totalPurchaseIGST)}</td><td className="px-5 py-3 text-right font-bold text-emerald-600">-{formatCurrency(totalITC)}</td></tr>
                <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold text-indigo-700 dark:text-indigo-300">
                  <td className="px-5 py-3">Net Payable</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, totalSalesCGST - totalPurchaseCGST))}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, totalSalesSGST - totalPurchaseSGST))}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(Math.max(0, totalSalesIGST - totalPurchaseIGST))}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(netPayable)}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
