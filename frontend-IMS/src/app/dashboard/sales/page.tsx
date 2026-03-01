'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuEye, LuFileText, LuX, LuLoader } from 'react-icons/lu';
import { useInvoices, useCreateInvoice, useDeleteInvoice, type Invoice, type InvoiceFormData, type InvoiceItem } from '@/hooks/useInvoices';
import { useParties } from '@/hooks/useParties';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  partially_paid: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'sale', status: statusFilter, search, page });
  const deleteInvoice = useDeleteInvoice();
  const { addToast } = useToast();

  const invoices = data?.invoices || [];
  const total = data?.total || 0;

  const totalSales = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.amount_paid || 0), 0);

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Invoice Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Sales Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 self-start">
          <LuPlus className="w-4 h-4" /> New Invoice
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Sales', value: formatCurrency(totalSales), color: 'text-indigo-600' },
          { label: 'Received', value: formatCurrency(totalPaid), color: 'text-emerald-600' },
          { label: 'Outstanding', value: formatCurrency(totalSales - totalPaid), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search invoice number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'sent', 'paid', 'partially_paid', 'overdue'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize ${statusFilter === s ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /><span className="ml-2 text-gray-500">Loading...</span></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <LuFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first sales invoice</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><LuPlus className="w-4 h-4 inline mr-1" /> New Invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Invoice #</th>
                  <th className="px-5 py-3 font-medium">Party</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Paid</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatCurrency(inv.amount_paid || 0)}</td>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice {viewInvoice.invoice_number}</h2>
                <button onClick={() => setViewInvoice(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                {[['Party', viewInvoice.party?.name || '—'], ['Date', new Date(viewInvoice.invoice_date).toLocaleDateString('en-IN')],
                  ['Due Date', viewInvoice.due_date ? new Date(viewInvoice.due_date).toLocaleDateString('en-IN') : '—'],
                  ['Subtotal', formatCurrency(viewInvoice.subtotal)], ['CGST', formatCurrency(viewInvoice.cgst_amount)],
                  ['SGST', formatCurrency(viewInvoice.sgst_amount)], ['IGST', formatCurrency(viewInvoice.igst_amount)],
                  ['Total', formatCurrency(viewInvoice.total_amount)], ['Paid', formatCurrency(viewInvoice.amount_paid || 0)],
                  ['Status', viewInvoice.status], ['Notes', viewInvoice.notes || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{v}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Invoice?</h3>
              <p className="text-sm text-gray-500 mt-2">This will permanently delete this invoice and its items.</p>
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
        {showModal && <InvoiceFormModal invoiceType="sale" onClose={() => setShowModal(false)} />}
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

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0, discount: 0, gst_rate: 18, gst_amount: 0, total: 0 }]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === 'product_id' && productsData?.products) {
      const product = productsData.products.find((p) => p.id === value);
      if (product) {
        updated[index].unit_price = product.selling_price;
        updated[index].gst_rate = product.gst_rate;
        updated[index].product_name = product.name;
      }
    }

    const itm = updated[index];
    const subtotal = itm.quantity * itm.unit_price - itm.discount;
    itm.gst_amount = subtotal * itm.gst_rate / 100;
    itm.total = subtotal + itm.gst_amount;
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price - i.discount, 0);
  const totalGst = items.reduce((s, i) => s + i.gst_amount, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async () => {
    if (!partyId || items.length === 0) { addToast({ type: 'warning', title: 'Missing data', message: 'Select a party and add items' }); return; }
    try {
      await createInvoice.mutateAsync({
        invoice_type: invoiceType, party_id: partyId, invoice_date: invoiceDate, due_date: dueDate || invoiceDate,
        subtotal, discount_amount: items.reduce((s, i) => s + i.discount, 0),
        cgst_amount: totalGst / 2, sgst_amount: totalGst / 2, igst_amount: 0, total_amount: grandTotal,
        status: 'draft', notes, items,
      });
      addToast({ type: 'success', title: 'Invoice Created' });
      onClose();
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New {invoiceType === 'sale' ? 'Sales' : 'Purchase'} Invoice</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Party *</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
              <option value="">Select party</option>
              {(partiesData?.parties || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" />
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Line Items</h3>
            <button onClick={addItem} className="text-sm text-indigo-600 font-medium flex items-center gap-1"><LuPlus className="w-4 h-4" /> Add Item</button>
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
                    <select value={itm.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none">
                      <option value="">Select</option>
                      {(productsData?.products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1"><label className="text-xs text-gray-500">Qty</label><input type="number" min="1" value={itm.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" /></div>
                  <div className="col-span-2"><label className="text-xs text-gray-500">Price</label><input type="number" value={itm.unit_price} onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" /></div>
                  <div className="col-span-1"><label className="text-xs text-gray-500">GST%</label><input type="number" value={itm.gst_rate} onChange={(e) => updateItem(idx, 'gst_rate', Number(e.target.value))} className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" /></div>
                  <div className="col-span-3 flex items-end gap-2">
                    <div className="flex-1"><label className="text-xs text-gray-500">Total</label><p className="font-semibold text-sm text-gray-900 dark:text-white py-2">{formatCurrency(itm.total)}</p></div>
                    <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LuX className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">CGST</span><span>{formatCurrency(totalGst / 2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">SGST</span><span>{formatCurrency(totalGst / 2)}</span></div>
          <div className="flex justify-between text-base font-bold border-t pt-2"><span>Grand Total</span><span className="text-indigo-600">{formatCurrency(grandTotal)}</span></div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={createInvoice.isPending} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {createInvoice.isPending && <LuLoader className="w-4 h-4 animate-spin" />} Create Invoice
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
