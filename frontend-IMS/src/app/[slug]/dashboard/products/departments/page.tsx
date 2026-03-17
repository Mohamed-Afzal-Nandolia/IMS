'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuPlus, LuPencil, LuTrash2, LuFolder, LuX, LuLoader } from 'react-icons/lu';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, type Department } from '@/hooks/useDepartments';
import { useToast } from '@/components/ui/Toast';
import { Portal } from '@/components/ui/Portal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function DepartmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: departments, isLoading } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const { addToast } = useToast();

  const handleSubmit = async (name: string, description: string) => {
    try {
      if (editing) { await updateDept.mutateAsync({ id: editing.id, name, description }); addToast({ type: 'success', title: 'Department Updated' }); }
      else { await createDept.mutateAsync({ name, description }); addToast({ type: 'success', title: 'Department Added' }); }
      setShowModal(false); setEditing(null);
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDept.mutateAsync(id); addToast({ type: 'success', title: 'Deleted' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{departments?.length || 0} total departments</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <LuPlus className="w-4 h-4" /> Add Department
        </button>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : !departments?.length ? (
          <div className="text-center py-20"><LuFolder className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No departments yet</p><button onClick={() => setShowModal(true)} className="mt-3 text-indigo-600 text-sm font-medium">+ Add Department</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{d.name}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{d.description || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditing(d); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuPencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
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
      <AnimatePresence>
        {showModal && <DepartmentModal dept={editing} isSubmitting={createDept.isPending || updateDept.isPending} onSubmit={handleSubmit} onClose={() => { setShowModal(false); setEditing(null); }} />}
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Department?</h3>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function DepartmentModal({ dept, isSubmitting, onSubmit, onClose }: { dept: Department | null; isSubmitting: boolean; onSubmit: (name: string, desc: string) => void; onClose: () => void }) {
  const [name, setName] = useState(dept?.name || '');
  const [desc, setDesc] = useState(dept?.description || '');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dept ? 'Edit' : 'Add'} Department</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, desc); }} className="space-y-6">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department Name *</label><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/20 transition-all text-gray-900 dark:text-white" placeholder="Menswear, Electronics, etc." /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label><textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none resize-none focus-visible:border-indigo-500 transition-all text-gray-900 dark:text-white" placeholder="Optional department details..." /></div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
              {isSubmitting ? 'Saving...' : dept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
