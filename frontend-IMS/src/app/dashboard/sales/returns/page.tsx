'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuTrash2, LuFileText, LuLoader, LuEye, LuX } from 'react-icons/lu';
import { useInvoices, useDeleteInvoice, useCreateInvoice, type Invoice, type InvoiceItem } from '@/hooks/useInvoices';
import { useParties } from '@/hooks/useParties';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  partially_paid: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  refunded: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
};

export default function SalesReturnsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'sales_return', search, page });
  const deleteInvoice = useDeleteInvoice();
  const { addToast } = useToast();

  const invoices = data?.invoices || [];
  const totalItems = data?.total || 0;
  const totalAmount = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalRefunded = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Sales Return Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Sales Returns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{totalItems} credit notes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 self-start">
          <LuPlus className="w-4 h-4" /> New Return
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Returns', value: formatCurrency(totalAmount), color: 'text-indigo-600' },
          { label: 'Refunded', value: formatCurrency(totalRefunded), color: 'text-emerald-600' },
          { label: 'Pending Refund', value: formatCurrency(totalAmount - totalRefunded), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <LuSearch className="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search return number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /><span className="ml-2 text-gray-500">Loading...</span></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <LuFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">No sales returns found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first credit note</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><LuPlus className="w-4 h-4 inline mr-1" /> New Return</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Return #</th>
                  <th className="px-5 py-3 font-medium">Party</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Refunded</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-3 text-right text-gray-500 tabnum">{formatCurrency(inv.amountPaid || 0)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[inv.status] || ''}`}>{inv.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewInvoice(inv)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuEye className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(inv.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Return {viewInvoice.invoiceNumber}</h2>
                <button onClick={() => setViewInvoice(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                {[['Party', viewInvoice.party?.name || '—'], ['Date', new Date(viewInvoice.issueDate).toLocaleDateString('en-IN')],
                  ['Subtotal', formatCurrency(viewInvoice.subtotal)], ['CGST', formatCurrency(viewInvoice.cgstAmount)],
                  ['SGST', formatCurrency(viewInvoice.sgstAmount)], ['IGST', formatCurrency(viewInvoice.igstAmount)],
                  ['Total Return', formatCurrency(viewInvoice.totalAmount)], ['Refunded', formatCurrency(viewInvoice.amountPaid || 0)],
                  ['Status', viewInvoice.status], ['Notes', viewInvoice.notes || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 gap-1 sm:gap-4">
                    <span className="text-gray-500 min-w-[100px] shrink-0">{l}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize text-right break-words whitespace-pre-wrap max-w-full">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Return?</h3>
              <p className="text-sm text-gray-500 mt-2">This will permanently delete this return record and its items.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteInvoice.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">{deleteInvoice.isPending ? 'Deleting...' : 'Delete'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {showModal && <InvoiceFormModal invoiceType="sales_return" onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function InvoiceFormModal({ invoiceType, onClose }: { invoiceType: string; onClose: () => void }) {
  const { data: partiesData } = useParties({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 100 });
  const createInvoice = useCreateInvoice();
  const { addToast } = useToast();

  const [partyId, setPartyId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0, taxRate: 18, taxAmount: 0, totalPrice: 0 }]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === 'productId' && productsData?.products) {
      const product = productsData.products.find((p) => p.id === value);
      if (product) {
        updated[index].unitPrice = product.sellingPrice || 0;
        updated[index].taxRate = product.gstRate || 0;
        updated[index].productName = product.name;
      }
    }

    const itm = updated[index];
    const subtotal = itm.quantity * itm.unitPrice;
    itm.taxAmount = subtotal * itm.taxRate / 100;
    itm.totalPrice = subtotal + itm.taxAmount;
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalGst = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async () => {
    if (!partyId || items.length === 0) { addToast({ type: 'warning', title: 'Missing data', message: 'Select a party and add items' }); return; }
    try {
      await createInvoice.mutateAsync({
        type: invoiceType, partyId: partyId, issueDate: invoiceDate, dueDate: dueDate || invoiceDate,
        subtotal,
        cgstAmount: totalGst / 2, sgstAmount: totalGst / 2, igstAmount: 0, totalAmount: grandTotal,
        status: 'draft', notes, items,
      });
      addToast({ type: 'success', title: 'Return Created' });
      onClose();
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Sales Return</h2>
            <p className="text-sm text-gray-500 mt-1">Record items returned by your customer.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><LuX className="w-6 h-6" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Party *</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white">
              <option value="">Choose a customer...</option>
              {(partiesData?.parties || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" />
          </div>
        </div>

        {/* Items */}
        <div className="mb-8 p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Returned Items</h3>
            <button onClick={addItem} className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"><LuPlus className="w-4 h-4" /> Add Item</button>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p className="text-sm text-gray-400">No items added yet</p>
              <button onClick={addItem} className="mt-2 text-sm text-indigo-600 font-medium">+ Add Item</button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((itm, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                  <div className="col-span-4">
                    <label className="text-xs text-gray-500">Product</label>
                    <select value={itm.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none">
                      <option value="">Select</option>
                      {(productsData?.products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1"><label className="text-xs text-gray-500">Qty</label><input type="number" min="1" value={itm.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm tabnum" /></div>
                  <div className="col-span-2"><label className="text-xs text-gray-500">Price</label><input type="number" value={itm.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm tabnum" /></div>
                  <div className="col-span-1"><label className="text-xs text-gray-500">GST%</label><input type="number" value={itm.taxRate} onChange={(e) => updateItem(idx, 'taxRate', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm tabnum" /></div>
                  <div className="col-span-3 flex items-end gap-2">
                    <div className="flex-1"><label className="text-xs text-gray-500">Total</label><p className="font-semibold text-sm text-gray-900 dark:text-white py-2 tabnum">{formatCurrency(itm.totalPrice)}</p></div>
                    <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LuX className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-red-600 dark:text-red-400 uppercase tracking-wider text-xs font-bold">Return Reason / Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g., damaged goods, wrong item delivered..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-red-500 transition-all text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="space-y-3 bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Items value</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Tax adjustment</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(totalGst)}</span></div>
            <div className="flex justify-between text-xl font-bold border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <span className="text-gray-900 dark:text-white">Total Refund</span>
              <span className="text-red-600 dark:text-red-400 tabnum">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={createInvoice.isPending} className="px-10 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95">
            {createInvoice.isPending && <LuLoader className="w-4 h-4 animate-spin" />} Issue Credit Note
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
