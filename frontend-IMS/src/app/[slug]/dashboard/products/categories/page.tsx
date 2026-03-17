'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuPlus, LuPencil, LuTrash2, LuFolder, LuX, LuLoader, 
  LuCornerDownRight, LuBox, LuLayers, LuChevronRight, LuChevronDown,
  LuLayoutGrid
} from 'react-icons/lu';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from '@/hooks/useCategories';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, type Department } from '@/hooks/useDepartments';
import { useToast } from '@/components/ui/Toast';
import { Portal } from '@/components/ui/Portal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

type HierarchyType = 'department' | 'category' | 'subcategory';

interface HierarchyItem {
  type: HierarchyType;
  data: any;
  parentId?: string;
  departmentId?: string;
}

export default function HierarchyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<HierarchyItem | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ type: HierarchyType; id: string } | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  
  const { addToast } = useToast();

  const toggleDept = (id: string) => {
    const next = new Set(expandedDepts);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedDepts(next);
  };

  const toggleCat = (id: string) => {
    const next = new Set(expandedCats);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedCats(next);
  };

  const handleSubmit = async (name: string, description: string, deptId?: string, parentId?: string) => {
    try {
      if (modalConfig?.type === 'department') {
        if (modalConfig.data) {
          await updateDept.mutateAsync({ id: modalConfig.data.id, name, description });
          addToast({ type: 'success', title: 'Department Updated' });
        } else {
          await createDept.mutateAsync({ name, description });
          addToast({ type: 'success', title: 'Department Added' });
        }
      } else {
        const payload = {
          name,
          description,
          department: deptId ? { id: deptId } : null,
          parent: parentId ? { id: parentId } : null
        };
        if (modalConfig?.data) {
          await updateCat.mutateAsync({ id: modalConfig.data.id, ...payload });
          addToast({ type: 'success', title: 'Category Updated' });
        } else {
          await createCat.mutateAsync(payload);
          addToast({ type: 'success', title: 'Category Added' });
        }
      }
      setModalOpen(false);
      setModalConfig(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfig) return;
    try {
      if (deleteConfig.type === 'department') {
        await deleteDept.mutateAsync(deleteConfig.id);
      } else {
        await deleteCat.mutateAsync(deleteConfig.id);
      }
      addToast({ type: 'success', title: 'Deleted successfully' });
      setDeleteConfig(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const isLoading = catsLoading || deptsLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Product Hierarchy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Departments, Categories, and Subcategories in one place.</p>
        </div>
        <button
          onClick={() => { setModalConfig({ type: 'department', data: null }); setModalOpen(true); }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <LuPlus className="w-4 h-4" /> Add Department
        </button>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
            <LuLoader className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading hierarchy...</p>
          </div>
        ) : !departments?.length ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LuLayoutGrid className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start Building Your Hierarchy</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2 text-sm">
                Create departments first, then add categories and subcategories to organize your products effectively.
            </p>
            <button 
              onClick={() => { setModalConfig({ type: 'department', data: null }); setModalOpen(true); }} 
              className="mt-8 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md inline-flex items-center gap-2"
            >
              <LuPlus className="w-4 h-4" /> Create First Department
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {departments.map((dept) => (
              <DepartmentNode 
                key={dept.id} 
                dept={dept} 
                categories={categories || []}
                expanded={expandedDepts.has(dept.id)}
                expandedCats={expandedCats}
                onToggle={() => toggleDept(dept.id)}
                onToggleCat={toggleCat}
                onEdit={() => { setModalConfig({ type: 'department', data: dept }); setModalOpen(true); }}
                onDelete={() => setDeleteConfig({ type: 'department', id: dept.id })}
                onAddCategory={() => { setModalConfig({ type: 'category', data: null, departmentId: dept.id }); setModalOpen(true); }}
                onAddSubcategory={(catId) => { setModalConfig({ type: 'subcategory', data: null, parentId: catId }); setModalOpen(true); }}
                onEditCategory={(cat) => { setModalConfig({ type: cat.parent ? 'subcategory' : 'category', data: cat }); setModalOpen(true); }}
                onDeleteCategory={(cat) => setDeleteConfig({ type: cat.parent ? 'subcategory' : 'category', id: cat.id })}
              />
            ))}
          </div>
        )}
      </motion.div>

      <Portal>
        <AnimatePresence>
          {modalOpen && (
            <HierarchyModal 
              config={modalConfig}
              isSubmitting={createDept.isPending || updateDept.isPending || createCat.isPending || updateCat.isPending}
              onSubmit={handleSubmit}
              onClose={() => { setModalOpen(false); setModalConfig(null); }}
            />
          )}
          {deleteConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteConfig(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuTrash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete {deleteConfig.type}?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This action is permanent and will remove all nested items. Are you sure?
                </p>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setDeleteConfig(null)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-none">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function DepartmentNode({ 
  dept, categories, expanded, expandedCats, onToggle, onToggleCat, 
  onEdit, onDelete, onAddCategory, onAddSubcategory, onEditCategory, onDeleteCategory 
}: { 
  dept: Department; categories: Category[]; expanded: boolean; expandedCats: Set<string>;
  onToggle: () => void; onToggleCat: (id: string) => void;
  onEdit: () => void; onDelete: () => void; onAddCategory: () => void;
  onAddSubcategory: (catId: string) => void; onEditCategory: (cat: Category) => void; onDeleteCategory: (cat: Category) => void;
}) {
  const deptCats = categories.filter(c => c.department?.id === dept.id && !c.parent);

  return (
    <div className="group/dept">
      <div className={`flex items-start sm:items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all cursor-pointer ${expanded ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-indigo-500 flex-shrink-0">
            <LuLayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">{dept.name}</h4>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
              <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-tight">Dept</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">• {deptCats.length} Categories</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 ml-2">
          <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover/dept:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
            <button onClick={onAddCategory} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-1 text-[10px] sm:text-xs font-bold whitespace-nowrap"><LuPlus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Category</span></button>
            <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button onClick={onEdit} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"><LuPencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"><LuTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
          </div>
          <div className={`p-1 rounded-lg transition-transform ${expanded ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}>
            <LuChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/10 dark:bg-gray-800/5">
            <div className="pl-6 sm:pl-12 pr-4 sm:pr-6 py-2 divide-y divide-gray-100/50 dark:divide-gray-700/30">
              {deptCats.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-400 italic">No categories in this department yet.</p>
                </div>
              ) : (
                deptCats.map(cat => (
                  <CategoryNode 
                    key={cat.id} 
                    cat={cat} 
                    allCategories={categories}
                    expanded={expandedCats.has(cat.id)}
                    onToggle={() => onToggleCat(cat.id)}
                    onEdit={() => onEditCategory(cat)}
                    onDelete={() => onDeleteCategory(cat)}
                    onAddSub={(id) => onAddSubcategory(id)}
                    onEditSub={onEditCategory}
                    onDeleteSub={onDeleteCategory}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryNode({ cat, allCategories, expanded, onToggle, onEdit, onDelete, onAddSub, onEditSub, onDeleteSub }: {
    cat: Category; allCategories: Category[]; expanded: boolean;
    onToggle: () => void; onEdit: () => void; onDelete: () => void;
    onAddSub: (id: string) => void; onEditSub: (cat: Category) => void; onDeleteSub: (cat: Category) => void;
}) {
  const subcats = allCategories.filter(c => c.parent?.id === cat.id);

  return (
    <div className="group/cat">
      <div className="flex items-center justify-between py-3 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <LuChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${expanded ? 'rotate-90 text-indigo-500' : 'text-gray-300'}`} />
          <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex-shrink-0">
            <LuLayers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate block">{cat.name}</span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">{subcats.length} sub</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/cat:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
          <button onClick={() => onAddSub(cat.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all flex items-center gap-1 text-[10px] font-bold"><LuPlus className="w-3 h-3" /> <span className="hidden sm:inline">Sub</span></button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-all"><LuPencil className="w-3.5 h-3.5 flex-shrink-0" /></button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 transition-all"><LuTrash2 className="w-3.5 h-3.5 flex-shrink-0" /></button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-l border-indigo-100 dark:border-indigo-900/20 ml-5 sm:ml-8 mb-2">
            <div className="pl-3 sm:pl-4 py-1 space-y-0.5">
              {subcats.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic py-2">No items.</p>
              ) : (
                subcats.map(sub => (
                  <div key={sub.id} className="group/sub flex items-center justify-between py-2 px-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all cursor-default min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <LuCornerDownRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium truncate">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover/sub:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => onEditSub(sub)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-all"><LuPencil className="w-3 h-3" /></button>
                      <button onClick={() => onDeleteSub(sub)} className="p-1.5 text-gray-400 hover:text-red-600 transition-all"><LuTrash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HierarchyModal({ config, isSubmitting, onSubmit, onClose }: { config: HierarchyItem | null; isSubmitting: boolean; onSubmit: (name: string, desc: string, dept?: string, parent?: string) => void; onClose: () => void }) {
  const [name, setName] = useState(config?.data?.name || '');
  const [desc, setDesc] = useState(config?.data?.description || '');
  
  const typeLabels = {
    department: 'Department',
    category: 'Category',
    subcategory: 'Subcategory'
  };

  const modalType = config?.type || 'category';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{config?.data ? 'Edit' : 'Add'} {typeLabels[modalType]}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {config?.data ? 'Update details.' : `Create new ${modalType}.`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><LuX className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, desc, config?.departmentId || config?.data?.department?.id, config?.parentId || config?.data?.parent?.id); }} className="space-y-4 sm:space-y-6">
          <div className="p-3 sm:p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/20 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-indigo-600 shadow-sm">
                {modalType === 'department' ? <LuLayoutGrid className="w-5 h-5" /> : modalType === 'category' ? <LuFolder className="w-5 h-5" /> : <LuCornerDownRight className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-indigo-500">Managing {modalType}</span>
                <p className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-medium truncate">Parent: {modalType === 'department' ? 'Root' : (config?.departmentId || config?.parentId ? 'Selected Parent' : 'Existing')}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{typeLabels[modalType]} Name *</label>
            <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 sm:py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/5 transition-all text-gray-900 dark:text-white" placeholder={`Enter ${modalType} name...`} />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
            <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full px-4 py-3 sm:py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none resize-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/5 transition-all text-gray-900 dark:text-white" placeholder="Optional details..." />
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-8 py-2.5 sm:py-3 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
              {isSubmitting ? 'Wait...' : config?.data ? 'Update' : `Create ${typeLabels[modalType]}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
