'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, type Product } from '@/hooks/useProducts';
import { Portal } from '@/components/ui/Portal';
import { formatCurrency } from '@/lib/utils';

interface ProductSearchCellProps {
  /** Current text value of the field */
  value: string;
  /** Called on every keystroke (free text) */
  onChange: (val: string) => void;
  /** Called when the user picks an existing product from the list */
  onSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  /** Mark the row as a brand-new product (not in DB) */
  isNew?: boolean;
}

/**
 * Smart product-name input with a search dropdown.
 *
 * Behaviour:
 *  - On focus  → shows last 10 recently-added products (no query)
 *  - On typing → debounces 350 ms, then hits the backend with the typed name
 *  - On select → fires onSelect(product) so the parent can auto-fill related fields
 */
export function ProductSearchCell({
  value,
  onChange,
  onSelect,
  placeholder = 'Search product...',
  className = '',
  isNew,
}: ProductSearchCellProps) {
  const [inputVal, setInputVal] = useState(value || '');
  const [show, setShow] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  /* ── keep in sync when parent resets value ── */
  useEffect(() => { setInputVal(value || ''); }, [value]);

  /* ── debounce search query ── */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputVal), 350);
    return () => clearTimeout(timer);
  }, [inputVal]);

  /* ── fetch: empty query = last 10 recent; typed query = search ── */
  const { data, isFetching } = useProducts({ search: debouncedQuery, pageSize: 10 });
  const products = data?.products || [];

  /* ── position dropdown below the input ── */
  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 220),
      });
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

  const handleSelect = (p: Product) => {
    setInputVal(p.name);
    onChange(p.name);
    onSelect?.(p);
    setShow(false);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center">
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => { updateCoords(); setShow(true); }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onChange={(e) => {
          setInputVal(e.target.value);
          onChange(e.target.value);
        }}
        className={className}
      />
      {isNew && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 pointer-events-none">
          NEW
        </span>
      )}

      <AnimatePresence>
        {show && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.12 }}
              className="fixed bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-[9999] max-h-52 overflow-y-auto no-scrollbar"
              style={{
                top: coords.top + 4 - window.scrollY,
                left: coords.left - window.scrollX,
                width: coords.width,
              }}
            >
              {/* hint label */}
              <div className="px-3 py-1.5 text-[9px] text-gray-400 font-semibold uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <span>{debouncedQuery ? `Results for "${debouncedQuery}"` : 'Recent products'}</span>
                {isFetching && (
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                )}
              </div>

              {products.length === 0 ? (
                <div className="px-3 py-5 text-center text-[11px] text-gray-400">
                  {isFetching ? 'Searching…' : debouncedQuery ? 'No products found — type to create new' : 'No products yet'}
                </div>
              ) : (
                products.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 outline-none"
                  >
                    <div className="text-[12px] font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">
                      {p.name}
                    </div>
                    <div className="flex justify-between items-center mt-0.5 gap-2">
                      <span className="text-[9px] text-gray-400 font-mono truncate">
                        {p.sku || 'N/A'} · {p.size || '-'} / {p.color || '-'} / {p.brand || '-'}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 shrink-0">
                        {formatCurrency(p.purchasePrice)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
