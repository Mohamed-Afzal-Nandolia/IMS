'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuPlus, LuPencil, LuTrash2, LuFolder, LuX, LuLoader } from 'react-icons/lu';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category, type CategoryFormData } from '@/hooks/useCategories';
import { useToast } from '@/components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const { addToast } = useToast();

  const handleSubmit = async (name: string, description: string) => {
    try {
      if (editing) { await updateCat.mutateAsync({ id: editing.id, name, description }); addToast({ type: 'success', title: 'Category Updated' }); }
      else { await createCat.mutateAsync({ name, description }); addToast({ type: 'success', title: 'Category Added' }); }
      setShowModal(false); setEditing(null);
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCat.mutateAsync(id); addToast({ type: 'success', title: 'Deleted' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1><p className="text-sm text-gray-500 mt-1">{categories?.length || 0} categories</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold flex items-center gap-2"><LuPlus className="w-4 h-4" /> Add Category</button>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : !categories?.length ? (
          <div className="text-center py-20"><LuFolder className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No categories yet</p><button onClick={() => setShowModal(true)} className="mt-3 text-indigo-600 text-sm font-medium">+ Add Category</button></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50"><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Description</th><th className="px-5 py-3 font-medium text-center">Actions</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500">{c.description || '—'}</td>
                  <td className="px-5 py-3"><div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"><LuPencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && <CategoryModal cat={editing} isSubmitting={createCat.isPending || updateCat.isPending} onSubmit={handleSubmit} onClose={() => { setShowModal(false); setEditing(null); }} />}
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" /><h3 className="text-lg font-bold">Delete Category?</h3>
              <div className="flex gap-3 mt-6"><button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button><button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryModal({ cat, isSubmitting, onSubmit, onClose }: { cat: Category | null; isSubmitting: boolean; onSubmit: (name: string, desc: string) => void; onClose: () => void }) {
  const [name, setName] = useState(cat?.name || '');
  const [desc, setDesc] = useState(cat?.description || '');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{cat ? 'Edit' : 'Add'} Category</h2><button onClick={onClose}><LuX className="w-5 h-5" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, desc); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-medium">Cancel</button><button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-50">{isSubmitting ? 'Saving...' : cat ? 'Update' : 'Add'}</button></div>
        </form>
      </motion.div>
    </motion.div>
  );
}
