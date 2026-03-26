'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  LuPlus, LuSearch, LuDownload, LuUpload,
  LuPencil, LuTrash2, LuEye, LuPackage, LuX, LuLoader,
} from 'react-icons/lu';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product, type ProductFormData } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/components/ui/Toast';
import { Portal } from '@/components/ui/Portal';
import BulkProductForm from './BulkProductForm';

// Lazy-load the heavy form modal — only downloads when user clicks "Add/Edit Product"
// rule: bundle-dynamic-imports — large components not needed on initial render
const ProductFormModal = dynamic(() => import('./ProductFormModal'), { ssr: false });

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
  const [activeView, setActiveView] = useState<'list' | 'bulk'>('list');

  const { data, isLoading } = useProducts({ search, stockFilter, page, pageSize: 20 });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { addToast } = useToast();

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  // Short-circuit to bulk add form
  if (activeView === 'bulk') {
    return <BulkProductForm onClose={() => setActiveView('list')} />;
  }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      addToast({ type: 'error', title: 'Error', message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      addToast({ type: 'success', title: 'Product Deleted' });
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      addToast({ type: 'error', title: 'Error', message });
    }
  };

  // rule: rendering-conditional-render — use ternary, not && for JSX conditionals
  const stockBadge = (p: Product) => {
    if ((p.currentStock || 0) <= 0) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">Out of Stock</span>;
    if (p.isLowStock) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Low Stock</span>;
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
          <button
            onClick={() => setActiveView('bulk')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <LuPlus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setStockFilter(f); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${stockFilter === f ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
            >
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
            <span className="ml-2 text-gray-500">Loading products…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <LuPackage className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first product to get started</p>
            <button
              onClick={() => setActiveView('bulk')}
              className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              <LuPlus className="w-4 h-4 inline mr-1" /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full min-w-[1800px] text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <th className="px-5 py-3 font-medium sticky left-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Product / Item</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium text-center">HSN</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium text-center">Size</th>
                  <th className="px-5 py-3 font-medium text-center">Color</th>
                  <th className="px-5 py-3 font-medium text-center">Material</th>
                  <th className="px-5 py-3 font-medium text-center">Unit</th>
                  <th className="px-5 py-3 font-medium text-right">Purchase Price</th>
                  <th className="px-5 py-3 font-medium text-right">Selling Price</th>
                  <th className="px-5 py-3 font-medium text-right">MRP</th>
                  <th className="px-5 py-3 font-medium text-center">GST%</th>
                  <th className="px-5 py-3 font-medium text-center">Stock</th>
                  <th className="px-5 py-3 font-medium text-center">Min Stock</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100/50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)] min-w-[150px]">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.sku || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400">{p.hsnCode || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.category?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.brand || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400">{p.size || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400 capitalize">{p.color || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400">{p.material || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 text-xs rounded font-bold uppercase mx-3 inline-block my-2 tracking-wider">{p.unit || '—'}</td>
                    <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400 tabnum">{formatCurrency(p.purchasePrice)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400 tabnum">{formatCurrency(p.mrp)}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400 tabnum">{p.gstRate}%</td>
                    <td className="px-5 py-3 text-center font-bold text-gray-900 dark:text-white tabnum">{p.currentStock || 0}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400 tabnum">{p.minStockLevel || 0}</td>
                    <td className="px-5 py-3 text-center">{stockBadge(p)}</td>
                    <td className="px-5 py-3 sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewProduct(p)} aria-label="View product" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuEye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingProduct(p); setShowModal(true); }} aria-label="Edit product" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuPencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} aria-label="Delete product" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${page === i+1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <Portal>
        <AnimatePresence>
          {viewProduct !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setViewProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h2>
                  <button onClick={() => setViewProduct(null)} aria-label="Close" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ['Name', viewProduct.name],
                    ['SKU', viewProduct.sku],
                    ['HSN Code', viewProduct.hsnCode],
                    ['Category', viewProduct.category?.name ?? '—'],
                    ['Unit', viewProduct.unit],
                    ['Sale Price', formatCurrency(viewProduct.sellingPrice)],
                    ['Purchase Price', formatCurrency(viewProduct.purchasePrice)],
                    ['GST Rate', `${viewProduct.gstRate}%`],
                    ['Stock', `${viewProduct.currentStock || 0} ${viewProduct.unit}`],
                    ['Min Stock', `${viewProduct.minStockLevel} ${viewProduct.unit}`],
                    ['Description', viewProduct.description || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 dark:text-white tabnum">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Delete Confirmation */}
      <Portal>
        <AnimatePresence>
          {deleteConfirm !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center"
              >
                <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h3>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleteProduct.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteProduct.isPending ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Add/Edit Modal — lazy-loaded (code-split) */}
      <Portal>
        <AnimatePresence>
          {showModal && (
            <ProductFormModal
              product={editingProduct}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
              onSubmit={handleSubmit}
              onClose={() => { setShowModal(false); setEditingProduct(null); }}
            />
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}
