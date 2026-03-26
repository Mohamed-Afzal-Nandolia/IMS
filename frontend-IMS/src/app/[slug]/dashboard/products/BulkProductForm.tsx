'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuPlus, LuX, LuBox, LuLoader } from 'react-icons/lu';
import { useCreateProduct, type ProductFormData } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDepartments } from '@/hooks/useDepartments';
import { useBusiness } from '@/hooks/useBusiness';
import { useProductTemplates, useCreateProductTemplateValue } from '@/hooks/useProductTemplates';
import { Portal } from '@/components/ui/Portal';
import { useToast } from '@/components/ui/Toast';
import { ProductSearchCell } from '@/components/ui/ProductSearchCell';
import { formatCurrency } from '@/lib/utils';

type BulkRow = Omit<ProductFormData, 'attributes'> & {
  _key: number;
  material?: string;
  attributes?: Record<string, string>;
  isNew?: boolean;
};

const emptyRow = (key: number, defaultMinStock = 10): BulkRow => ({
  _key: key,
  name: '',
  sku: '',
  hsnCode: '',
  category_id: null,
  unit: 'pcs',
  sellingPrice: 0,
  purchasePrice: 0,
  mrp: 0,
  gstRate: 0,
  currentStock: 0,
  minStockLevel: defaultMinStock,
  size: '',
  color: '',
  brand: '',
  material: '',
  discountRate: 0,
  description: '',
  isActive: true,
  attributes: {},
  isNew: true,
});

export default function BulkProductForm({ onClose }: { onClose: () => void }) {
  const createProduct = useCreateProduct();
  const { data: businessData } = useBusiness();
  const { data: templates = [] } = useProductTemplates();
  const { data: depts } = useDepartments();
  const { data: allCats } = useCategories();
  const { addToast } = useToast();

  const sortedTemplates = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
  const defaultMin = businessData?.globalMinStockLevel || 10;

  const [rows, setRows] = useState<BulkRow[]>([emptyRow(0, defaultMin)]);
  const keyRef = useRef(1);

  // Update default min stock once business data loads
  useEffect(() => {
    if (businessData?.globalMinStockLevel) {
      setRows(prev =>
        prev.map(r => r.minStockLevel === 10 ? { ...r, minStockLevel: businessData.globalMinStockLevel! } : r)
      );
    }
  }, [businessData]);

  const addRow = () => {
    setRows(prev => [...prev, emptyRow(keyRef.current++, defaultMin)]);
  };

  const updateRow = (key: number, field: string, value: any) => {
    if (field === '_productSelected') {
      const p = value;
      setRows(prev => prev.map(r => r._key === key ? { 
        ...r, 
        name: p.name,
        sku: p.sku || '',
        hsnCode: p.hsnCode || '',
        sellingPrice: p.sellingPrice || 0,
        purchasePrice: p.purchasePrice || 0,
        mrp: p.mrp || 0,
        gstRate: p.gstRate || 0,
        currentStock: p.currentStock || 0,
        minStockLevel: p.minStockLevel !== 10 ? r.minStockLevel : (p.minStockLevel || 10),
        unit: p.unit || r.unit,
        size: p.size || '',
        color: p.color || '',
        brand: p.brand || '',
        material: p.material || '',
        attributes: p.attributes ? (typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes) : {},
        category_id: p.category?.id || null,
        isNew: false
      } : r));
    } else if (field === 'name') {
      setRows(prev => prev.map(r => r._key === key ? { ...r, name: value, isNew: true } : r));
    } else {
      setRows(prev => prev.map(r => r._key === key ? { ...r, [field]: value } : r));
    }
  };

  const removeRow = (key: number) => {
    setRows(prev => prev.filter(r => r._key !== key));
  };

  const handleSave = async () => {
    const filled = rows.filter(r => r.name.trim());
    if (filled.length === 0) {
      addToast({ type: 'warning', title: 'No products', message: 'Enter at least one product name.' });
      return;
    }
    try {
      await Promise.all(
        filled.map(r =>
          createProduct.mutateAsync({
            name: r.name,
            sku: r.sku,
            hsnCode: r.hsnCode,
            category_id: r.category_id,
            unit: r.unit,
            sellingPrice: r.sellingPrice,
            purchasePrice: r.purchasePrice,
            mrp: (r as any).mrp || 0,
            gstRate: r.gstRate,
            currentStock: r.currentStock || 0,
            minStockLevel: r.minStockLevel,
            size: r.size,
            color: r.color,
            brand: r.brand,
            material: (r as any).material || '',
            discountRate: r.discountRate,
            description: r.description,
            isActive: r.isActive,
            attributes: JSON.stringify((r as any).attributes || {}),
          })
        )
      );
      addToast({ type: 'success', title: 'Products Saved', message: `${filled.length} product(s) added.` });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Add Products</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the spreadsheet below — rows with a name will be saved.</p>
        </div>
        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all">
          <LuX className="w-6 h-6" />
        </button>
      </div>

      {/* Table */}
      <div className="p-0 sm:p-4 bg-gray-50/30 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 sm:px-2 sm:py-3 mb-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LuBox className="w-4 h-4 text-indigo-500" /> Product Rows
          </h3>
          <button
            onClick={addRow}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <LuPlus className="w-3 h-3" /> Add Row
          </button>
        </div>

        <div className="relative overflow-x-auto overflow-y-visible pb-10 custom-scrollbar rounded-xl">
          <table className="w-full min-w-[1200px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-bold bg-white dark:bg-gray-900 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
                <th className="px-3 py-3 w-8 border-b border-gray-100 dark:border-gray-800">#</th>
                <th className="px-3 py-3 w-44 border-b border-gray-100 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Product / Item *</th>
                <th className="px-2 py-3 w-32 border-b border-gray-100 dark:border-gray-800">SKU</th>
                <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Brand</th>
                <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Size</th>
                <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Color</th>
                <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">Material</th>
                <th className="px-2 py-3 w-24 border-b border-gray-100 dark:border-gray-800">Unit</th>
                <th className="px-2 py-3 w-20 text-center border-b border-gray-100 dark:border-gray-800">Qty</th>
                <th className="px-2 py-3 w-28 text-right border-b border-gray-100 dark:border-gray-800">Cost Price</th>
                <th className="px-2 py-3 w-28 text-right border-b border-gray-100 dark:border-gray-800">Sell Price</th>
                <th className="px-2 py-3 w-28 text-right border-b border-gray-100 dark:border-gray-800">MRP</th>
                <th className="px-2 py-3 w-28 border-b border-gray-100 dark:border-gray-800">HSN</th>
                <th className="px-2 py-3 w-32 border-b border-gray-100 dark:border-gray-800">Hierarchy</th>
                <th className="px-2 py-3 w-20 text-center border-b border-gray-100 dark:border-gray-800">GST%</th>
                <th className="px-2 py-3 w-24 text-center border-b border-gray-100 dark:border-gray-800">Min Stock</th>
                <th className="px-3 py-3 w-28 border-b border-gray-100 dark:border-gray-800 text-right">Total</th>
                <th className="px-2 py-3 w-10 border-b border-gray-100 dark:border-gray-800 sticky right-0 bg-white dark:bg-gray-900 shadow-[-1px_0_0_rgba(0,0,0,0.05)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {rows.map((row, idx) => (
                <BulkRow
                  key={row._key}
                  idx={idx}
                  row={row}
                  templates={sortedTemplates}
                  depts={depts || []}
                  allCats={allCats || []}
                  onChange={(field, val) => updateRow(row._key, field, val)}
                  onRemove={() => removeRow(row._key)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={createProduct.isPending}
          className="px-10 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
        >
          {createProduct.isPending && <LuLoader className="w-4 h-4 animate-spin" />}
          Save All Products
        </button>
      </div>
    </motion.div>
  );
}

// ─── Row Component ──────────────────────────────────────────────────────────

function BulkRow({
  idx, row, templates, depts, allCats, onChange, onRemove,
}: {
  idx: number;
  row: BulkRow;
  templates: any[];
  depts: any[];
  allCats: any[];
  onChange: (field: string, val: any) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="group hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors">
      <td className="px-3 py-2 text-[11px] font-mono text-gray-400 border-b border-gray-100 dark:border-gray-800">
        {idx + 1}
      </td>

      {/* Name */}
      <td className="p-0 border-b border-gray-100 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
        <ProductSearchCell 
          value={row.name}
          onChange={(val) => onChange('name', val)}
          onSelect={(p: any) => onChange('_productSelected', p)}
          isNew={row.isNew}
          placeholder="Product name..."
          className={`w-full h-10 bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-inset focus:ring-indigo-500/30 pl-3 transition-shadow ${row.isNew ? 'pr-12' : 'pr-3'}`}
        />
      </td>

      {/* SKU */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.sku || ''}
          onChange={e => onChange('sku', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] font-mono text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8"
        />
      </td>

      {/* Brand */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.brand || ''}
          onChange={e => onChange('brand', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 uppercase placeholder:normal-case"
        />
      </td>

      {/* Size */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.size || ''}
          onChange={e => onChange('size', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 uppercase placeholder:normal-case"
        />
      </td>

      {/* Color */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.color || ''}
          onChange={e => onChange('color', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 capitalize placeholder:normal-case"
        />
      </td>

      {/* Material */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.material || ''}
          onChange={e => onChange('material', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 capitalize placeholder:normal-case"
        />
      </td>

      {/* Unit */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.unit || ''}
          onChange={e => onChange('unit', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 lowercase placeholder:normal-case"
        />
      </td>

      {/* Qty (Current Stock) */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={row.currentStock === 0 ? '' : row.currentStock}
          onChange={e => onChange('currentStock', Number(e.target.value))}
          placeholder="0"
          className="w-full bg-transparent border-none outline-none text-[13px] text-center font-bold focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum"
        />
      </td>

      {/* Cost Price */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={row.purchasePrice || ''}
          onChange={e => onChange('purchasePrice', Number(e.target.value))}
          className="w-full bg-transparent border-none outline-none text-[13px] font-mono focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum text-right"
        />
      </td>

      {/* Sell Price */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={row.sellingPrice || ''}
          onChange={e => onChange('sellingPrice', Number(e.target.value))}
          className="w-full bg-transparent border-none outline-none text-[13px] font-mono text-emerald-600 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum text-right"
        />
      </td>

      {/* MRP */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={(row as any).mrp || ''}
          onChange={e => onChange('mrp', Number(e.target.value))}
          className="w-full bg-transparent border-none outline-none text-[13px] font-mono text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum text-right"
        />
      </td>

      {/* HSN */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={row.hsnCode}
          onChange={e => onChange('hsnCode', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[11px] text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 uppercase"
        />
      </td>

      {/* Category */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <select
          value={row.category_id || ''}
          onChange={e => onChange('category_id', e.target.value || null)}
          className="w-full bg-transparent border-none outline-none text-[11px] text-gray-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 cursor-pointer"
        >
          <option value="">Select...</option>
          {depts.map((d: any) => (
            <React.Fragment key={d.id}>
              <option value={d.id} className="font-bold">[{d.name}]</option>
              {allCats.filter((c: any) => c.department?.id === d.id).map((c: any) => (
                <option key={c.id} value={c.id}>&nbsp;&nbsp;• {c.name}</option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </td>

      {/* GST % */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={row.gstRate}
          onChange={e => onChange('gstRate', Number(e.target.value))}
          className="w-full bg-transparent border-none outline-none text-[13px] text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum"
        />
      </td>

      {/* Min Stock */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          type="number"
          value={row.minStockLevel}
          onChange={e => onChange('minStockLevel', Number(e.target.value))}
          className="w-full bg-transparent border-none outline-none text-[13px] text-center focus:ring-1 focus:ring-indigo-500 rounded px-1 h-8 tabnum"
        />
      </td>

      {/* Total */}
      <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-right font-bold text-gray-900 dark:text-white text-[13px] tabnum">
        {formatCurrency((row.currentStock || 0) * (row.purchasePrice || 0))}
      </td>

      {/* Remove */}
      <td className="px-2 py-2 border-b border-gray-100 dark:border-gray-800 sticky right-0 bg-white dark:bg-gray-900 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
        <button onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <LuX className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// ─── Attribute Cell (same pattern as purchases page) ────────────────────────

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

  const filteredValues = (template.values || []).filter((v: any) =>
    v.value.toLowerCase().includes(val.toLowerCase())
  );

  const handleSelect = (v: string) => { setVal(v); onChange(v); setShow(false); };

  const handleCreate = async () => {
    if (!val) return;
    try {
      await createValue.mutateAsync({ templateId: template.id, value: val, sortOrder: (template.values?.length || 0) + 1 });
      onChange(val);
      setShow(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div ref={containerRef} className="relative w-full h-8 px-1">
      <input
        type="text"
        value={val}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const exact = filteredValues.find((v: any) => v.value.toLowerCase() === val.toLowerCase());
            if (exact) handleSelect(exact.value);
            else handleCreate();
          }
        }}
        className="w-full h-full bg-transparent border-none outline-none text-[12px] text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-indigo-500 rounded px-1 transition-all uppercase placeholder:normal-case"
        placeholder={`${template.label}...`}
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
                  onMouseDown={e => { e.preventDefault(); handleSelect(v.value); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-[11px] font-medium transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  {v.value}
                </button>
              ))}
              {val && !filteredValues.some((v: any) => v.value.toLowerCase() === val.toLowerCase()) && (
                <button
                  onMouseDown={e => { e.preventDefault(); handleCreate(); }}
                  className="w-full text-left px-3 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between"
                >
                  <span>Create "{val}"</span>
                  <LuPlus className="w-3 h-3" />
                </button>
              )}
              {filteredValues.length === 0 && !val && (
                <div className="px-3 py-3 text-center text-[10px] text-gray-400 italic">No values. Type to create.</div>
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
