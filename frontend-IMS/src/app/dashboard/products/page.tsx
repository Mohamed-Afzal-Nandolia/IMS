'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  LuPlus, LuSearch, LuFilter, LuDownload, LuUpload,
  LuPencil, LuTrash2, LuEye, LuPackage, LuX, LuLoader,
} from 'react-icons/lu';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product, type ProductFormData } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'in_stock' | 'out_of_stock'>('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useProducts({ search, stockFilter, page, pageSize: 20 });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { addToast } = useToast();

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ ...formData, id: editingProduct.id });
        addToast({ type: 'success', title: 'Product Updated', message: `${formData.name} has been updated.` });
      } else {
        await createProduct.mutateAsync(formData);
        addToast({ type: 'success', title: 'Product Added', message: `${formData.name} has been added.` });
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to save product' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      addToast({ type: 'success', title: 'Product Deleted' });
      setDeleteConfirm(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete' });
    }
  };

  const stockBadge = (qty: number) => {
    if (qty === 0) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">Out of Stock</span>;
    if (qty < 20) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Low Stock</span>;
    return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">In Stock</span>;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><LuUpload className="w-4 h-4" /> Import</button>
          <button className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><LuDownload className="w-4 h-4" /> Export</button>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
            <LuPlus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((f) => (
            <button key={f} onClick={() => { setStockFilter(f); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${stockFilter === f ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {f === 'all' ? 'All' : f === 'in_stock' ? 'In Stock' : f === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LuLoader className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <LuPackage className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first product to get started</p>
            <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
              <LuPlus className="w-4 h-4 inline mr-1" /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">HSN</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-center">GST</th>
                  <th className="px-5 py-3 font-medium text-center">Stock</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.hsn_code}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.category?.name || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(p.selling_price)}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{p.gst_rate}%</td>
                    <td className="px-5 py-3 text-center font-semibold text-gray-900 dark:text-white">{p.current_stock}</td>
                    <td className="px-5 py-3 text-center">{stockBadge(p.current_stock)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewProduct(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuEye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuPencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700/50">
            <p className="text-sm text-gray-500">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === i+1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <AnimatePresence>
        {viewProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewProduct(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h2>
                <button onClick={() => setViewProduct(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Name', viewProduct.name], ['SKU', viewProduct.sku], ['HSN Code', viewProduct.hsn_code],
                  ['Category', viewProduct.category?.name || '—'], ['Unit', viewProduct.unit],
                  ['Sale Price', formatCurrency(viewProduct.selling_price)], ['Purchase Price', formatCurrency(viewProduct.purchase_price)],
                  ['GST Rate', `${viewProduct.gst_rate}%`], ['Stock', `${viewProduct.current_stock} ${viewProduct.unit}`],
                  ['Min Stock', `${viewProduct.min_stock_level} ${viewProduct.unit}`], ['Description', viewProduct.description || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h3>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteProduct.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                  {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductFormModal
            product={editingProduct}
            categories={categories || []}
            isSubmitting={createProduct.isPending || updateProduct.isPending}
            onSubmit={handleSubmit}
            onClose={() => { setShowModal(false); setEditingProduct(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductFormModal({ product, categories, isSubmitting, onSubmit, onClose }: {
  product: Product | null;
  categories: any[];
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name || '',
    sku: product?.sku || '',
    hsn_code: product?.hsn_code || '',
    category_id: product?.category_id || null,
    unit: product?.unit || 'pcs',
    selling_price: product?.selling_price || 0,
    purchase_price: product?.purchase_price || 0,
    gst_rate: product?.gst_rate || 18,
    current_stock: product?.current_stock || 0,
    min_stock_level: product?.min_stock_level || 10,
    description: product?.description || '',
    is_active: product?.is_active ?? true,
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
              <input required value={form.sku} onChange={(e) => update('sku', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSN Code</label>
              <input value={form.hsn_code} onChange={(e) => update('hsn_code', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category_id || ''} onChange={(e) => update('category_id', e.target.value || null)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500">
                <option value="">No Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500">
                {['pcs', 'kg', 'g', 'L', 'mL', 'box', 'pack', 'dozen', 'meter', 'set'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Rate (%)</label>
              <select value={form.gst_rate} onChange={(e) => update('gst_rate', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500">
                {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.selling_price || ''} onChange={(e) => update('selling_price', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.purchase_price || ''} onChange={(e) => update('purchase_price', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stock</label>
              <input type="number" min="0" value={form.current_stock || ''} onChange={(e) => update('current_stock', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Stock Level</label>
              <input type="number" min="0" value={form.min_stock_level || ''} onChange={(e) => update('min_stock_level', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <LuLoader className="w-4 h-4 animate-spin" />}
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
