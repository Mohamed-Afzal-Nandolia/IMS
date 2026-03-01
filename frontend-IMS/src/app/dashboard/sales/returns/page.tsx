'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuSearch, LuFileText, LuLoader, LuTrash2 } from 'react-icons/lu';
import { useInvoices, useDeleteInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function SalesReturnsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useInvoices({ type: 'sale_return', search });
  const invoices = data?.invoices || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Returns</h1><p className="text-sm text-gray-500 mt-1">{invoices.length} credit notes</p></motion.div>
      <motion.div variants={item} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md">
        <LuSearch className="w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
      </motion.div>
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        : invoices.length === 0 ? <div className="text-center py-20"><LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No sales returns</p><p className="text-sm text-gray-400 mt-1">Credit notes will appear here when created</p></div>
        : <table className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b bg-gray-50/50"><th className="px-5 py-3">Return #</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
          <tbody>{invoices.map((inv) => (<tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-5 py-3 font-semibold text-indigo-600">{inv.invoice_number}</td><td className="px-5 py-3">{inv.party?.name || '—'}</td><td className="px-5 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td><td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.total_amount)}</td></tr>))}</tbody></table>}
      </motion.div>
    </motion.div>
  );
}
