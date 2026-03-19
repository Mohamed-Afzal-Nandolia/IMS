'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuX, LuLoader } from 'react-icons/lu';
import type { Product, ProductFormData } from '@/hooks/useProducts';
import { useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useDepartments } from '@/hooks/useDepartments';
import { useBusiness } from '@/hooks/useBusiness';
import { useProductTemplates } from '@/hooks/useProductTemplates';

interface ProductFormModalProps {
  product: Product | null;
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  product,
  isSubmitting,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const { data: allCategories } = useCategories();
  const { data: allDepartments } = useDepartments();
  const { data: businessData } = useBusiness();
  const { data: templates } = useProductTemplates();

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name || '',
    sku: product?.sku || '',
    hsnCode: product?.hsnCode || '',
    category_id: product?.category?.id || null,
    unit: product?.unit || 'pcs',
    sellingPrice: product?.sellingPrice || 0,
    purchasePrice: product?.purchasePrice || 0,
    gstRate: product?.gstRate || 0,
    minStockLevel: product?.minStockLevel ?? (businessData?.globalMinStockLevel || 10),
    size: product?.size || '',
    color: product?.color || '',
    brand: product?.brand || '',
    discountRate: product?.discountRate || 0,
    description: product?.description || '',
    isActive: product?.isActive ?? true,
  });

  //     isActive: product?.isActive ?? true,
  // });

  // Reverse engineer the dropdowns when editing an existing product
  useEffect(() => {
    if (allCategories && form.category_id && !selectedDept && !selectedCat) {
      const leaf = allCategories.find((c) => c.id === form.category_id);
      if (leaf) {
        if (leaf.parent) {
          setSelectedCat(leaf.parent.id);
          const parentCat = allCategories.find((c) => c.id === leaf.parent!.id);
          if (parentCat?.department) setSelectedDept(parentCat.department.id);
        } else {
          setSelectedCat(leaf.id);
          if (leaf.department) setSelectedDept(leaf.department.id);
        }
      }
    }
  }, [allCategories, form.category_id, selectedDept, selectedCat]);

  // Update minStockLevel when businessData loads if it's a new product and still default
  useEffect(() => {
    if (!product && businessData?.globalMinStockLevel && form.minStockLevel === 10) {
      update('minStockLevel', businessData.globalMinStockLevel);
    }
  }, [businessData, product]);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const topLevelCats = allCategories?.filter(c => !c.parent && (!selectedDept || c.department?.id === selectedDept)) || [];
  const subCats = allCategories?.filter(c => c.parent?.id === selectedCat) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to {product ? 'update' : 'create'} your product.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* --- Section: Basic Info --- */}
            <div className="col-span-full mb-2"><h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Basic Information</h3></div>
            
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                id="prod-name"
                required
                autoComplete="off"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/20 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* Size, Color, Brand Row */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                <div className="relative group/size">
                  <input
                    value={form.size}
                    onChange={(e) => update('size', e.target.value)}
                    placeholder="e.g. XL, 42"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-10 hidden group-focus-within/size:block max-h-40 overflow-y-auto no-scrollbar">
                    {templates?.find(t => t.templateType === 'SIZE' || t.name.toUpperCase() === 'SIZE')?.values.map(v => (
                      <button key={v.id} type="button" onMouseDown={() => update('size', v.value)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs">{v.value}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="relative group/color">
                  <input
                    value={form.color}
                    onChange={(e) => update('color', e.target.value)}
                    placeholder="e.g. Black"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-10 hidden group-focus-within/color:block max-h-40 overflow-y-auto no-scrollbar">
                    {templates?.find(t => t.templateType === 'COLOR' || t.name.toUpperCase() === 'COLOR')?.values.map(v => (
                      <button key={v.id} type="button" onMouseDown={() => update('color', v.value)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs">{v.value}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <div className="relative group/brand">
                  <input
                    value={form.brand}
                    onChange={(e) => update('brand', e.target.value)}
                    placeholder="e.g. Nike"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-10 hidden group-focus-within/brand:block max-h-40 overflow-y-auto no-scrollbar">
                    {templates?.find(t => t.templateType === 'BRAND' || t.name.toUpperCase() === 'BRAND')?.values.map(v => (
                      <button key={v.id} type="button" onMouseDown={() => update('brand', v.value)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs">{v.value}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="col-span-full pt-4 border-t border-gray-100 dark:border-gray-800/50 mb-2"><h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Pricing & Tax</h3></div>

            {/* Selling Price */}
            <div>
              <label htmlFor="prod-selling" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/20 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* GST Rate */}
            <div>
              <label htmlFor="prod-gst" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                GST Rate (%)
              </label>
              <select
                id="prod-gst"
                value={form.gstRate}
                onChange={(e) => update('gstRate', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              >
                {[0, 5, 12, 18, 28].map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>

            {/* Discount Rate */}
            <div>
              <label htmlFor="prod-discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Default Discount (%)
              </label>
              <input
                id="prod-discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discountRate || ''}
                onChange={(e) => update('discountRate', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label htmlFor="prod-purchase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="prod-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                SKU
              </label>
              <input
                id="prod-sku"
                autoComplete="off"
                spellCheck={false}
                value={form.sku}
                placeholder="Auto-generated if left blank"
                onChange={(e) => update('sku', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            
            {/* HSN Code */}
            <div>
              <label htmlFor="prod-hsn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                HSN Code
              </label>
              <input
                id="prod-hsn"
                autoComplete="off"
                spellCheck={false}
                inputMode="numeric"
                value={form.hsnCode}
                onChange={(e) => update('hsnCode', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="prod-dept" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Department
              </label>
              <select
                id="prod-dept"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedCat('');
                  update('category_id', null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              >
                <option value="">Any Department</option>
                {allDepartments?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </label>
              <select
                id="prod-category"
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  update('category_id', e.target.value || null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              >
                <option value="">No Category</option>
                {topLevelCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor="prod-subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subcategory
              </label>
              <select
                id="prod-subcategory"
                value={subCats.some(c => c.id === form.category_id) ? form.category_id! : ''}
                onChange={(e) => {
                  update('category_id', e.target.value || selectedCat || null);
                }}
                disabled={!selectedCat || subCats.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">No Subcategory</option>
                {subCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="col-span-full pt-4 border-t border-gray-100 dark:border-gray-800/50 mb-2"><h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Inventory Settings</h3></div>

            {/* Unit */}
            <div>
              <label htmlFor="prod-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Unit of Measurement
              </label>
              <select
                id="prod-unit"
                value={form.unit}
                onChange={(e) => update('unit', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              >
                {['pcs', 'kg', 'g', 'L', 'mL', 'box', 'pack', 'dozen', 'meter', 'set'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            {/* Min Stock Level */}
            <div>
              <label htmlFor="prod-minstock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Minimum Stock Alert
              </label>
              <input
                id="prod-minstock"
                type="number"
                min="0"
                inputMode="numeric"
                autoComplete="off"
                value={form.minStockLevel || ''}
                onChange={(e) => update('minStockLevel', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
            {/* Description */}
            <div>
              <label htmlFor="prod-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description & Notes
              </label>
              <textarea
                id="prod-desc"
                rows={3}
                autoComplete="off"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              {isSubmitting && <LuLoader className="w-4 h-4 animate-spin" />}
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
