'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuEye, LuFileText, LuX, LuLoader, LuBox } from 'react-icons/lu';
import { ProductSearchCell } from '@/components/ui/ProductSearchCell';
import { useInvoices, useCreateInvoice, useDeleteInvoice, type Invoice, type InvoiceFormData, type InvoiceItem } from '@/hooks/useInvoices';
import { useParties } from '@/hooks/useParties';
import { useToast } from '@/components/ui/Toast';
import { Portal } from '@/components/ui/Portal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'sale', search, page });
  const deleteInvoice = useDeleteInvoice();
  const { addToast } = useToast();

  const invoices = data?.invoices || [];
  const total = data?.total || 0;

  const totalSales = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setActiveView('create');
        params.delete('action');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, []);

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Invoice Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  if (activeView === 'create') {
    return <InvoiceForm invoiceType="sale" onClose={() => setActiveView('list')} />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Sales Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} invoices</p>
        </div>
        <button onClick={() => setActiveView('create')} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 self-start">
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
            <button onClick={() => setActiveView('create')} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><LuPlus className="w-4 h-4 inline mr-1" /> New Invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Invoice #</th>
                  <th className="px-5 py-3 font-medium">Party</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Paid</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100/50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-3 text-right text-gray-500 tabnum">{formatCurrency(inv.amountPaid || 0)}</td>
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

      <Portal>
      {/* View Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice {viewInvoice.invoiceNumber}</h2>
                <button onClick={() => setViewInvoice(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><LuX className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 shrink-0">
                <div className="space-y-3 text-sm bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {[['Party', viewInvoice.party?.name || '—'], ['Date', new Date(viewInvoice.issueDate).toLocaleDateString('en-IN')],
                    ['Due Date', viewInvoice.dueDate ? new Date(viewInvoice.dueDate).toLocaleDateString('en-IN') : '—'],
                    ['Notes', viewInvoice.notes || '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex flex-col sm:flex-row sm:justify-between py-1.5 gap-1 sm:gap-4">
                      <span className="text-gray-500 dark:text-gray-400 min-w-[100px] shrink-0 font-medium">{l}</span>
                      <span className="font-bold text-gray-900 dark:text-white capitalize text-right break-words whitespace-pre-wrap max-w-full">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {[['Subtotal', formatCurrency(viewInvoice.subtotal)], ['CGST', formatCurrency(viewInvoice.cgstAmount)],
                    ['SGST', formatCurrency(viewInvoice.sgstAmount)], ['IGST', formatCurrency(viewInvoice.igstAmount)],
                    ['Total', formatCurrency(viewInvoice.totalAmount)], ['Paid', formatCurrency(viewInvoice.amountPaid || 0)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between py-1.5 gap-4">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{l}</span>
                      <span className={`font-bold tabnum ${l === 'Total' ? 'text-indigo-600 dark:text-indigo-400 text-base' : 'text-gray-900 dark:text-white'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              {viewInvoice.items && viewInvoice.items.length > 0 && (
                <div className="flex-1 min-h-[300px] flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0">
                    <LuBox className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sold Products</h3>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-gray-900">
                    <table className="w-full text-xs">
                      <thead className="text-left text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 dark:bg-gray-800/80 sticky top-0 border-b border-gray-200 dark:border-gray-700 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-bold">Product / Item</th>
                          <th className="px-4 py-3 font-bold text-center">Qty</th>
                          <th className="px-4 py-3 font-bold text-right">Price</th>
                          <th className="px-4 py-3 font-bold text-center">GST</th>
                          <th className="px-4 py-3 font-bold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {viewInvoice.items.map((itm, i) => (
                          <tr key={itm.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">{itm.product?.name || `Product ID: ${itm.productId}`}</td>
                            <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-bold tabnum">{itm.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 font-mono tabnum">{formatCurrency(itm.unitPrice)}</td>
                            <td className="px-4 py-3 text-center text-gray-500 font-mono text-[10px] tabnum">{itm.taxRate}%</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabnum">{formatCurrency(itm.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      <Portal>
      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
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
      </Portal>
    </motion.div>
  );
}

function InvoiceForm({ invoiceType, onClose }: { invoiceType: string; onClose: () => void }) {
  const { data: partiesData } = useParties({ pageSize: 100 });
  const createInvoice = useCreateInvoice();
  const { addToast } = useToast();

  const [partyId, setPartyId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<(InvoiceItem & { productName?: string; isNew?: boolean; })[]>([{ productId: '', quantity: 1, unitPrice: 0, taxRate: 0, taxAmount: 0, totalPrice: 0 }]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0, taxRate: 0, taxAmount: 0, totalPrice: 0 }]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === '_productSelected') {
      const product = value;
      updated[index].isNew = false;
      updated[index].productId = product.id;
      updated[index].productName = product.name;
      updated[index].unitPrice = product.sellingPrice || 0;
      updated[index].taxRate = product.gstRate || 0;
    } else if (field === 'productName') {
      updated[index].isNew = true;
      updated[index].productId = '';
    }

    const itm = updated[index];
    const subtotal = (itm.quantity || 0) * (itm.unitPrice || 0);
    itm.taxAmount = subtotal * (itm.taxRate || 0) / 100;
    itm.totalPrice = subtotal + itm.taxAmount;
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalGst = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async () => {
    const filledItems = items.filter(itm => itm.productId);
    const unselectedItems = items.filter(itm => itm.productName && !itm.productId);
    
    if (unselectedItems.length > 0) {
      addToast({ type: 'warning', title: 'Invalid Product', message: 'You have typed a product name that is not selected. Please select an existing product from the dropdown.' });
      return;
    }

    if (!partyId || filledItems.length === 0) { addToast({ type: 'warning', title: 'Missing data', message: 'Select a party and add valid items' }); return; }
    try {
      await createInvoice.mutateAsync({
        type: invoiceType, partyId: partyId, issueDate: invoiceDate, dueDate: dueDate || invoiceDate,
        subtotal,
        cgstAmount: totalGst / 2, sgstAmount: totalGst / 2, igstAmount: 0, totalAmount: grandTotal,
        notes, items: filledItems,
      });
      addToast({ type: 'success', title: 'Invoice Created' });
      onClose();
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New {invoiceType === 'sale' ? 'Sales' : 'Purchase'} Invoice</h2>
          <p className="text-sm text-gray-500 mt-1">Generate a professional tax invoice for your business.</p>
        </div>
        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all"><LuX className="w-6 h-6" /></button>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Party *</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white">
              <option value="">Choose a party...</option>
              {(partiesData?.parties || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" />
          </div>
        </div>

        {/* Items */}
        <div className="mb-8 p-0 sm:p-4 bg-gray-50/30 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between p-4 sm:px-2 sm:py-3 mb-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuBox className="w-4 h-4 text-indigo-500" /> Invoice Items
            </h3>
            <button onClick={addItem} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"><LuPlus className="w-3 h-3" /> Add Item</button>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-10 mx-4 sm:mx-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl group hover:border-indigo-300 transition-colors pointer-events-none">
              <LuBox className="w-10 h-10 mx-auto text-gray-300 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Your invoice is empty</p>
              <button onClick={addItem} className="mt-4 pointer-events-auto px-5 py-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add First Item</button>
            </div>
          ) : (
            <div className="relative overflow-x-auto overflow-y-visible pb-10 custom-scrollbar rounded-xl">
              <table className="w-full min-w-[700px] border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-white dark:bg-gray-900 sticky top-0 z-10 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <th className="px-3 py-3 w-10 sticky left-0 bg-white dark:bg-gray-900 z-20 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">#</th>
                    <th className="px-3 py-3 w-80 sticky left-10 bg-white dark:bg-gray-900 z-20 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Product / Item *</th>
                    <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800 text-center">Qty</th>
                    <th className="px-2 py-3 w-36 border-b border-gray-100 dark:border-gray-800 text-right">Price</th>
                    <th className="px-2 py-3 w-24 border-b border-gray-100 dark:border-gray-800 text-center">GST%</th>
                    <th className="px-3 py-3 w-36 border-b border-gray-100 dark:border-gray-800 text-right">Total</th>
                    <th className="px-2 py-3 w-12 border-b border-gray-100 dark:border-gray-800"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {items.map((itm, idx) => (
                    <SalesItemRow 
                      key={idx} 
                      idx={idx} 
                      itm={itm} 
                      updateItem={updateItem} 
                      removeItem={removeItem} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs font-bold">Additional Notes & Terms</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Terms & conditions or delivery instructions..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="space-y-3 bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">CGST</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(totalGst / 2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">SGST</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(totalGst / 2)}</span></div>
            <div className="flex justify-between text-xl font-bold border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <span className="text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-indigo-600 dark:text-indigo-400 tabnum">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={createInvoice.isPending} className="px-10 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
            {createInvoice.isPending && <LuLoader className="w-4 h-4 animate-spin" />} Save & Finalize Invoice
          </button>
        </div>
    </motion.div>
  );
}

function SalesItemRow({ idx, itm, updateItem, removeItem }: any) {
  return (
    <tr className="group hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors">
      <td className="px-3 py-2 text-[11px] font-mono text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">{idx + 1}</td>
      <td className="p-0 w-80 sticky left-10 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)] transition-all">
        <ProductSearchCell 
          value={itm.productName || ''}
          onChange={(val) => updateItem(idx, 'productName', val)}
          onSelect={(p: any) => updateItem(idx, '_productSelected', p)}
          isNew={itm.isNew}
          placeholder="Search product..."
          className={`w-full h-10 bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-inset focus:ring-indigo-500/30 pl-3 transition-shadow ${itm.isNew ? 'pr-12' : 'pr-3'}`}
        />
      </td>
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800"><input type="number" min="1" value={itm.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800"><input type="number" value={itm.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] font-mono text-right focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800"><input type="number" value={itm.taxRate} onChange={e => updateItem(idx, 'taxRate', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white text-[13px] tabnum border-b border-gray-100 dark:border-gray-800">{formatCurrency(itm.totalPrice)}</td>
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <LuX className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

