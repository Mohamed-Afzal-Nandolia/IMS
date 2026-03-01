'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuEye, LuTrash2, LuFileText, LuLoader, LuX } from 'react-icons/lu';
import { useInvoices, useDeleteInvoice, type Invoice } from '@/hooks/useInvoices';
import { useToast } from '@/components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  partially_paid: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

export default function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'purchase', status: statusFilter, search, page });
  const deleteInvoice = useDeleteInvoice();
  const { addToast } = useToast();

  const invoices = data?.invoices || [];
  const total = data?.total || 0;
  const totalPurchases = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Purchase Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{total} invoices • Total: {formatCurrency(totalPurchases)}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'paid', 'partially_paid', 'overdue'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize ${statusFilter === s ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No purchase invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Invoice #</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium text-right">Amount</th><th className="px-5 py-3 font-medium text-center">Status</th><th className="px-5 py-3 font-medium text-center">Actions</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-semibold text-indigo-600">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-5 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[inv.status] || ''}`}>{inv.status.replace('_', ' ')}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center justify-center gap-1">
                      <button onClick={() => setViewInvoice(inv)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"><LuEye className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(inv.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {viewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase {viewInvoice.invoice_number}</h2><button onClick={() => setViewInvoice(null)} className="p-2 rounded-xl hover:bg-gray-100"><LuX className="w-5 h-5" /></button></div>
              <div className="space-y-3 text-sm">
                {[['Supplier', viewInvoice.party?.name || '—'], ['Date', new Date(viewInvoice.invoice_date).toLocaleDateString('en-IN')], ['Total', formatCurrency(viewInvoice.total_amount)], ['Paid', formatCurrency(viewInvoice.amount_paid || 0)], ['Status', viewInvoice.status]].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-900 dark:text-white capitalize">{v}</span></div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" /><h3 className="text-lg font-bold">Delete?</h3>
              <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
