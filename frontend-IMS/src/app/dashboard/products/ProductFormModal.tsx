'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuX, LuLoader } from 'react-icons/lu';
import type { Product, ProductFormData } from '@/hooks/useProducts';

interface ProductFormModalProps {
  product: Product | null;
  categories: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  product,
  categories,
  isSubmitting,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name || '',
    sku: product?.sku || '',
    hsnCode: product?.hsnCode || '',
    category_id: product?.category?.id || null,
    unit: product?.unit || 'pcs',
    sellingPrice: product?.sellingPrice || 0,
    purchasePrice: product?.purchasePrice || 0,
    gstRate: product?.gstRate || 18,
    currentStock: product?.currentStock || 0,
    minStockLevel: product?.minStockLevel || 10,
    description: product?.description || '',
    isActive: product?.isActive ?? true,
  });

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                id="prod-name"
                required
                autoComplete="off"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="prod-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SKU *
              </label>
              <input
                id="prod-sku"
                required
                autoComplete="off"
                spellCheck={false}
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* HSN Code */}
            <div>
              <label htmlFor="prod-hsn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HSN Code
              </label>
              <input
                id="prod-hsn"
                autoComplete="off"
                spellCheck={false}
                inputMode="numeric"
                value={form.hsnCode}
                onChange={(e) => update('hsnCode', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="prod-category"
                value={form.category_id || ''}
                onChange={(e) => update('category_id', e.target.value || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="prod-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                id="prod-unit"
                value={form.unit}
                onChange={(e) => update('unit', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              >
                {['pcs', 'kg', 'g', 'L', 'mL', 'box', 'pack', 'dozen', 'meter', 'set'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* GST Rate */}
            <div>
              <label htmlFor="prod-gst" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GST Rate (%)
              </label>
              <select
                id="prod-gst"
                value={form.gstRate}
                onChange={(e) => update('gstRate', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              >
                {[0, 5, 12, 18, 28].map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>

            {/* Selling Price */}
            <div>
              <label htmlFor="prod-selling" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selling Price (₹) *
              </label>
              <input
                id="prod-selling"
                required
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                value={form.sellingPrice || ''}
                onChange={(e) => update('sellingPrice', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label htmlFor="prod-purchase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Price (₹)
              </label>
              <input
                id="prod-purchase"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                value={form.purchasePrice || ''}
                onChange={(e) => update('purchasePrice', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label htmlFor="prod-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Stock
              </label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                inputMode="numeric"
                autoComplete="off"
                value={form.currentStock || ''}
                onChange={(e) => update('currentStock', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>

            {/* Min Stock Level */}
            <div>
              <label htmlFor="prod-minstock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Stock Level
              </label>
              <input
                id="prod-minstock"
                type="number"
                min="0"
                inputMode="numeric"
                autoComplete="off"
                value={form.minStockLevel || ''}
                onChange={(e) => update('minStockLevel', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="prod-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="prod-desc"
              rows={2}
              autoComplete="off"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus-visible:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LuLoader className="w-4 h-4 animate-spin" />}
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
