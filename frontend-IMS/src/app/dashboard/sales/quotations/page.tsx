'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuEye, LuTrash2, LuFileText, LuLoader, LuX } from 'react-icons/lu';
import { useInvoices, useCreateInvoice, useDeleteInvoice, type Invoice, type InvoiceItem } from '@/hooks/useInvoices';
import { useParties } from '@/hooks/useParties';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function QuotationsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'quotation', search });
  const deleteInvoice = useDeleteInvoice();
  const createInvoice = useCreateInvoice();
  const { data: partiesData } = useParties({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 100 });
  const { addToast } = useToast();

  const invoices = data?.invoices || [];

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  const handleCreate = async (partyId: string, items: InvoiceItem[]) => {
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const totalGst = items.reduce((s, i) => s + i.gst_amount, 0);
    try {
      await createInvoice.mutateAsync({
        invoice_type: 'quotation', party_id: partyId, invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0], subtotal, discount_amount: 0,
        cgst_amount: totalGst / 2, sgst_amount: totalGst / 2, igst_amount: 0, total_amount: subtotal + totalGst,
        status: 'draft', items,
      });
      addToast({ type: 'success', title: 'Quotation Created' });
      setShowModal(false);
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h1><p className="text-sm text-gray-500 mt-1">{invoices.length} quotations</p></div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold flex items-center gap-2"><LuPlus className="w-4 h-4" /> New Quotation</button>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md">
        <LuSearch className="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        : invoices.length === 0 ? <div className="text-center py-20"><LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No quotations yet</p><button onClick={() => setShowModal(true)} className="mt-3 text-indigo-600 text-sm font-medium">+ Create Quotation</button></div>
        : <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b bg-gray-50/50"><th className="px-5 py-3">Quotation #</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-center">Actions</th></tr></thead>
            <tbody>{invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-semibold text-indigo-600">{inv.invoice_number}</td>
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.total_amount)}</td>
                <td className="px-5 py-3 text-center"><button onClick={() => setDeleteConfirm(inv.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </motion.div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" /><h3 className="text-lg font-bold">Delete?</h3>
              <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
