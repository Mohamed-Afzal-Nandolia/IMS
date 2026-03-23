'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuEye, LuTrash2, LuFileText, LuLoader, LuX, LuBox } from 'react-icons/lu';
import { useInvoices, useDeleteInvoice, useCreateInvoice, type Invoice, type InvoiceItem } from '@/hooks/useInvoices';
import { useParties, useCreateParty } from '@/hooks/useParties';
import { useProducts, useCreateProduct } from '@/hooks/useProducts';
import { useBusiness } from '@/hooks/useBusiness';
import { useDepartments } from '@/hooks/useDepartments';
import { useCategories } from '@/hooks/useCategories';
import { useProductTemplates, useCreateProductTemplateValue } from '@/hooks/useProductTemplates';
import { useToast } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';
import { ProductSearchCell } from '@/components/ui/ProductSearchCell';

const ProductFormModal = dynamic(() => import('../products/ProductFormModal'), { ssr: false });
import { Portal } from '@/components/ui/Portal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useInvoices({ type: 'purchase', search, page });
  const deleteInvoice = useDeleteInvoice();
  const { addToast } = useToast();

  const invoices = data?.invoices || [];
  const total = data?.total || 0;
  const totalPurchases = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  const handleDelete = async (id: string) => {
    try { await deleteInvoice.mutateAsync(id); addToast({ type: 'success', title: 'Deleted' }); setDeleteConfirm(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  if (activeView === 'create') {
    return <PurchaseForm onClose={() => setActiveView('list')} />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Purchase Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{total} invoices • Total: {formatCurrency(totalPurchases)}</p>
        </div>
        <button onClick={() => setActiveView('create')} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 self-start">
          <LuPlus className="w-4 h-4" /> New Purchase
        </button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
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
              <thead><tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Invoice #</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium text-right">Amount</th><th className="px-5 py-3 font-medium text-center">Actions</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100/50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-semibold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{inv.party?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                     <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(inv.totalAmount)}</td>
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

      <Portal>
      <AnimatePresence>
        {viewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase {viewInvoice.invoiceNumber}</h2><button onClick={() => setViewInvoice(null)} className="p-2 rounded-xl hover:bg-gray-100"><LuX className="w-5 h-5" /></button></div>
              <div className="space-y-3 text-sm">
                {[['Supplier', viewInvoice.party?.name || '—'], ['Date', new Date(viewInvoice.issueDate).toLocaleDateString('en-IN')], ['Total', formatCurrency(viewInvoice.totalAmount)], ['Paid', formatCurrency(viewInvoice.amountPaid || 0)]].map(([l, v]) => (
                  <div key={l} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 gap-1 sm:gap-4">
                    <span className="text-gray-500 min-w-[100px] shrink-0">{l}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize text-right break-words whitespace-pre-wrap max-w-full">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" /><h3 className="text-lg font-bold">Delete?</h3>
              <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function PurchaseForm({ onClose }: { onClose: () => void }) {
  const invoiceType = 'purchase';
  const { data: partiesData } = useParties({ pageSize: 100 });
  const createInvoice = useCreateInvoice();
  const createParty = useCreateParty();
  const createProduct = useCreateProduct();
  const { data: businessData } = useBusiness();
  const { addToast } = useToast();

  const [partyId, setPartyId] = useState('');
  const [partySearch, setPartySearch] = useState('');
  const [isNewParty, setIsNewParty] = useState(false);
  
  const { data: templates = [] } = useProductTemplates();
  const sortedTemplates = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
  
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<(InvoiceItem & { 
    isNew?: boolean; 
    unit?: string; 
    hsnCode?: string; 
    sellingPrice?: number; 
    deptId?: string; 
    catId?: string; 
    subCatId?: string; 
    minStock?: number;
    size?: string;
    color?: string;
    brand?: string;
    material?: string;
    attributes?: Record<string, string>;
  })[]>([{
    productId: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    taxAmount: 0,
    totalPrice: 0,
    unit: '',
    hsnCode: '',
    sellingPrice: 0,
    minStock: 10,
    size: '',
    color: '',
    brand: '',
    material: '',
    attributes: {}
  }]);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const daysFromPurchase = Math.floor((new Date().getTime() - new Date(invoiceDate).getTime()) / (1000 * 3600 * 24));

  const addItem = () => setItems([...items, { 
    productId: '', 
    quantity: 1, 
    unitPrice: 0, 
    taxRate: 0, 
    taxAmount: 0, 
    totalPrice: 0,
    unit: '',
    hsnCode: '',
    sellingPrice: 0,
    minStock: businessData?.globalMinStockLevel || 10,
    size: '',
    color: '',
    brand: '',
    material: '',
    attributes: {}
  }]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === '_productSelected') {
      const product = value;
      updated[index].isNew = false;
      updated[index].productId = product.id;
      updated[index].productName = product.name;
      updated[index].unitPrice = product.purchasePrice || 0;
      updated[index].sellingPrice = product.sellingPrice || 0;
      updated[index].taxRate = product.gstRate || 0;
      updated[index].unit = product.unit || 'pcs';
      updated[index].hsnCode = product.hsnCode || '';
      updated[index].minStock = product.minStockLevel || 0;
      updated[index].size = product.size || '';
      updated[index].color = product.color || '';
      updated[index].brand = product.brand || '';
      updated[index].material = product.material || '';
      updated[index].attributes = product.attributes ? (typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes) : {};
      updated[index].deptId = product.category?.id;
    } else if (field === 'productName') {
      updated[index].isNew = true;
      updated[index].productId = '';
    }

    const itm = updated[index];
    const subtotal = (itm.quantity || 0) * (itm.unitPrice || 0);
    itm.taxAmount = (subtotal * (itm.taxRate || 0)) / 100;
    itm.totalPrice = subtotal + itm.taxAmount;
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalGst = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async () => {
    const filledItems = items.filter(itm => itm.productId || itm.productName);
    if ((!partyId && !partySearch) || filledItems.length === 0) { 
      addToast({ type: 'warning', title: 'Missing data', message: 'Enter a supplier and add items' }); 
      return; 
    }
    
    try {
      let finalPartyId = partyId;
      
      // 1. Handle New Party Creation
      if (isNewParty) {
        const newParty = await createParty.mutateAsync({ name: partySearch, type: 'supplier' });
        finalPartyId = newParty.id;
      }

      // 2. Handle New Products Creation
      const finalItems = await Promise.all(filledItems.map(async (itm) => {
        if (itm.isNew) {
          const newProd = await createProduct.mutateAsync({
            name: itm.productName || 'New Product',
            unit: itm.unit,
            hsnCode: itm.hsnCode,
            purchasePrice: itm.unitPrice,
            sellingPrice: itm.sellingPrice || 0,
            gstRate: itm.taxRate ?? 0,
            minStockLevel: itm.minStock ?? 0,
            size: itm.size || '',
            color: itm.color || '',
            brand: itm.brand || '',
            material: itm.material || '',
            attributes: JSON.stringify(itm.attributes || {}),
            category_id: itm.subCatId || itm.catId || itm.deptId || null
          });
          return { ...itm, productId: newProd.id };
        }
        return itm;
      }));

      // 3. Create Invoice
      await createInvoice.mutateAsync({
        type: invoiceType, 
        partyId: finalPartyId, 
        issueDate: invoiceDate, 
        dueDate: dueDate || invoiceDate,
        subtotal,
        cgstAmount: totalGst / 2, 
        sgstAmount: totalGst / 2, 
        igstAmount: 0, 
        totalAmount: grandTotal,
        notes, 
        items: finalItems.map(itm => ({
          ...itm,
          attributes: JSON.stringify(itm.attributes || {})
        })),
      });

      addToast({ type: 'success', title: 'Purchase Recorded' });
      onClose();
    } catch (err: any) { 
      addToast({ type: 'error', title: 'Error', message: err.message }); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Record New Purchase</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to add inventory and record an invoice.</p>
        </div>
        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all"><LuX className="w-6 h-6" /></button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Supplier / Party *</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type name or select..."
                value={partySearch}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  setPartySearch(e.target.value);
                  const found = partiesData?.parties?.find(p => p.name.toLowerCase() === e.target.value.toLowerCase());
                  if (found) { setPartyId(found.id); setIsNewParty(false); }
                  else { setPartyId(''); setIsNewParty(true); }
                }}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 dark:text-white pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isNewParty && partySearch ? <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">NEW</span> : <LuSearch className="w-4 h-4" />}
              </div>
              
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto hidden group-focus-within:block no-scrollbar">
                {(partiesData?.parties || []).filter(p => !partySearch || p.name.toLowerCase().includes(partySearch.toLowerCase())).map(p => (
                  <button 
                    key={p.id} 
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      setPartyId(p.id); 
                      setPartySearch(p.name); 
                      setIsNewParty(false); 
                      (document.activeElement as HTMLElement)?.blur();
                    }} 
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-sm transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{p.phone || 'No Phone'} • {p.type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="mb-8 p-0 sm:p-4 bg-gray-50/30 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between p-4 sm:px-2 sm:py-3 mb-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuBox className="w-4 h-4 text-indigo-500" /> Purchase Items
            </h3>
            <button onClick={addItem} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"><LuPlus className="w-3 h-3" /> Add Item</button>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-10 mx-4 sm:mx-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl group hover:border-indigo-300 transition-colors pointer-events-none">
              <LuBox className="w-10 h-10 mx-auto text-gray-300 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-gray-500 font-medium tracking-wide Uppercase">Your invoice is empty</p>
              <button onClick={addItem} className="mt-4 pointer-events-auto px-5 py-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add First Item</button>
            </div>
          ) : (
            <div className="relative overflow-x-auto overflow-y-visible pb-10 custom-scrollbar rounded-xl">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-white dark:bg-gray-900 sticky top-0 z-10 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <th className="px-3 py-3 w-10 sticky left-0 bg-white dark:bg-gray-900 z-20 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">#</th>
                    <th className="px-3 py-3 w-40 sticky left-10 bg-white dark:bg-gray-900 z-20 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Product / Item *</th>
                    {sortedTemplates.map(t => (
                      <th key={t.id} className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">{t.label}</th>
                    ))}
                    <th className="px-2 py-3 w-24 border-b border-gray-100 dark:border-gray-800 text-center">Qty</th>
                    <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Cost Price</th>
                    <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Sell Price</th>
                    <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">HSN</th>
                    <th className="px-2 py-3 w-32 border-b border-gray-100 dark:border-gray-800">Hierarchy</th>
                    <th className="px-2 py-3 w-20 border-b border-gray-100 dark:border-gray-800 text-center">GST%</th>
                    <th className="px-2 py-3 w-20 border-b border-gray-100 dark:border-gray-800 text-center">Min Stock</th>
                    <th className="px-3 py-3 w-28 border-b border-gray-100 dark:border-gray-800 text-right">Total</th>
                    <th className="px-2 py-3 w-10 border-b border-gray-100 dark:border-gray-800"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {items.map((itm, idx) => (
                    <ItemRow 
                      key={idx} 
                      idx={idx} 
                      itm={itm} 
                      templates={sortedTemplates}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs font-bold">Purchase Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Entry notes or supplier remarks..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="space-y-3 bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Total Pre-tax</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Total GST</span><span className="font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(totalGst)}</span></div>
            <div className="flex justify-between text-xl font-bold border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <span className="text-gray-900 dark:text-white">Net Payable</span>
              <span className="text-indigo-600 dark:text-indigo-400 tabnum">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={createInvoice.isPending || createParty.isPending || createProduct.isPending} className="px-10 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
            {(createInvoice.isPending || createParty.isPending || createProduct.isPending) && <LuLoader className="w-4 h-4 animate-spin" />} Record Purchase
          </button>
        </div>

      <AnimatePresence>
        {showProductModal && (
          <ProductFormModal 
            product={null} 
            isSubmitting={false}
            onClose={() => setShowProductModal(false)}
            onSubmit={async (data) => {
              setShowProductModal(false);
              addToast({ type: 'info', title: 'Product Added', message: 'You can now select it in the row.' });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItemRow({ idx, itm, templates, updateItem, removeItem }: any) {
  const { data: depts } = useDepartments();
  const { data: cats } = useCategories();

  return (
    <tr className="group hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors">
      <td className="px-3 py-2 text-[11px] font-mono text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)]">{idx + 1}</td>
      <td className="p-0 w-40 sticky left-10 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800 shadow-[1px_0_0_rgba(0,0,0,0.05)] transition-all">
        <ProductSearchCell 
          value={itm.productName || ''}
          onChange={(val) => updateItem(idx, 'productName', val)}
          onSelect={(p: any) => updateItem(idx, '_productSelected', p)}
          isNew={itm.isNew}
          placeholder="Search product..."
          className={`w-full h-10 bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-inset focus:ring-indigo-500/30 pl-3 transition-shadow ${itm.isNew ? 'pr-12' : 'pr-3'}`}
        />
      </td>
      {templates.map((t: any) => (
        <td key={t.id} className="px-2 py-2">
          <AttributeCell 
            template={t} 
            value={
              t.templateType === 'SIZE' ? itm.size :
              t.templateType === 'COLOR' ? itm.color :
              t.templateType === 'BRAND' ? itm.brand :
              t.templateType === 'MATERIAL' ? itm.material :
              t.templateType === 'UNIT' ? itm.unit :
              itm.attributes?.[t.templateType] || ''
            }
            onChange={(val: string) => {
              if (t.templateType === 'SIZE') updateItem(idx, 'size', val);
              else if (t.templateType === 'COLOR') updateItem(idx, 'color', val);
              else if (t.templateType === 'BRAND') updateItem(idx, 'brand', val);
              else if (t.templateType === 'MATERIAL') updateItem(idx, 'material', val);
              else if (t.templateType === 'UNIT') updateItem(idx, 'unit', val);
              else {
                const attrs = { ...(itm.attributes || {}) };
                attrs[t.templateType] = val;
                updateItem(idx, 'attributes', attrs);
              }
            }}
          />
        </td>
      ))}
      <td className="px-2 py-2"><input type="number" value={itm.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2"><input type="number" value={itm.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] font-mono focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2"><input type="number" value={itm.sellingPrice} onChange={e => updateItem(idx, 'sellingPrice', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] font-mono text-emerald-600 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2"><input type="text" value={itm.hsnCode} onChange={e => updateItem(idx, 'hsnCode', e.target.value)} className="w-full bg-transparent border-none outline-none text-[11px] text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 uppercase" /></td>
      <td className="px-2 py-2">
        <select value={itm.subCatId || itm.catId || itm.deptId || ''} onChange={e => updateItem(idx, 'subCatId', e.target.value)} className="w-full bg-transparent border-none outline-none text-[11px] text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 cursor-pointer">
          <option value="">Select...</option>
          {(depts || []).map((d: any) => (
            <React.Fragment key={d.id}>
              <option value={d.id} className="font-bold">[{d.name}]</option>
              {(cats || []).filter((c: any) => c.department?.id === d.id).map((c: any) => (
                <option key={c.id} value={c.id}>&nbsp;&nbsp;&bull; {c.name}</option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </td>
      <td className="px-2 py-2"><input type="number" value={itm.taxRate} onChange={e => updateItem(idx, 'taxRate', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-2 py-2"><input type="number" value={itm.minStock} onChange={e => updateItem(idx, 'minStock', Number(e.target.value))} className="w-full bg-transparent border-none outline-none text-[13px] text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum" /></td>
      <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white text-[13px] tabnum">{formatCurrency(itm.totalPrice)}</td>
      <td className="px-2 py-2">
        <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <LuX className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function AttributeCell({ template, value, onChange }: { template: any; value: string; onChange: (v: string) => void }) {
  const [val, setVal] = useState(value || '');
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const createValue = useCreateProductTemplateValue();

  useEffect(() => { setVal(value || ''); }, [value]);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: Math.max(rect.width, 140) });
    }
  }, []);

  useEffect(() => {
    if (show) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [show, updateCoords]);

  const handleSelect = async (v: string) => {
    setVal(v);
    onChange(v);
    setShow(false);
  };

  const handleCreate = async () => {
    if (!val) return;
    try {
      await createValue.mutateAsync({ templateId: template.id, value: val, sortOrder: (template.values?.length || 0) + 1 });
      onChange(val);
      setShow(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredValues = (template.values || []).filter((v: any) => v.value.toLowerCase().includes(val.toLowerCase()));

  return (
    <div ref={containerRef} className="relative w-full h-8 px-1">
      <input 
        type="text" 
        value={val}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const exact = filteredValues.find((v: any) => v.value.toLowerCase() === val.toLowerCase());
            if (exact) handleSelect(exact.value);
            else handleCreate();
          }
        }}
        className="w-full h-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 transition-all uppercase placeholder:normal-case"
        placeholder={`Type ${template.label}...`}
      />
      <AnimatePresence>
        {show && (
          <Portal>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-[10000] max-h-48 overflow-y-auto no-scrollbar py-1"
              style={{ top: coords.top + 4 - window.scrollY, left: coords.left - window.scrollX, width: coords.width }}
            >
              {filteredValues.map((v: any) => (
                <button 
                  key={v.id} 
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(v.value); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-[11px] font-medium transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  {v.value}
                </button>
              ))}
              {val && !filteredValues.some((v: any) => v.value.toLowerCase() === val.toLowerCase()) && (
                <button 
                  onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
                  className="w-full text-left px-3 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between"
                >
                  <span>Create "{val}"</span>
                  <LuPlus className="w-3 h-3" />
                </button>
              )}
              {filteredValues.length === 0 && !val && (
                <div className="px-3 py-3 text-center text-[10px] text-gray-400 italic">No values available. Type to create.</div>
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickAddSupplierModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) {
  const createParty = useCreateParty();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', gstin: '', type: 'supplier' as const });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createParty.mutateAsync(form);
      addToast({ type: 'success', title: 'Supplier Added' });
      onSuccess(data.id);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold mb-4">Quick Add Supplier</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 mb-1">NAME *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none" /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">PHONE</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none" /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">GSTIN</label><input value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none" /></div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border text-sm font-medium">Cancel</button>
            <button type="submit" disabled={createParty.isPending} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">{createParty.isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

