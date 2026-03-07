'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuEye, LuUsers, LuX, LuLoader, LuPhone, LuMail } from 'react-icons/lu';
import { useParties, useCreateParty, useUpdateParty, useDeleteParty, type Party, type PartyFormData } from '@/hooks/useParties';
import { useToast } from '@/components/ui/Toast';
import { Portal } from '@/components/ui/Portal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function PartiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [viewParty, setViewParty] = useState<Party | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useParties({ search, type: typeFilter, page });
  const createParty = useCreateParty();
  const updateParty = useUpdateParty();
  const deleteParty = useDeleteParty();
  const { addToast } = useToast();

  const parties = data?.parties || [];
  const total = data?.total || 0;

  const handleSubmit = async (formData: PartyFormData) => {
    try {
      if (editingParty) {
        await updateParty.mutateAsync({ ...formData, id: editingParty.id });
        addToast({ type: 'success', title: 'Party Updated' });
      } else {
        await createParty.mutateAsync(formData);
        addToast({ type: 'success', title: 'Party Added', message: `${formData.name} has been added.` });
      }
      setShowModal(false);
      setEditingParty(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParty.mutateAsync(id);
      addToast({ type: 'success', title: 'Party Deleted' });
      setDeleteConfirm(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = {
      customer: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      supplier: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      both: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    };
    return <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${styles[type] || styles.customer}`}>{type}</span>;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Parties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} total parties</p>
        </div>
        <button onClick={() => { setEditingParty(null); setShowModal(true); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 self-start">
          <LuPlus className="w-4 h-4" /> Add Party
        </button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search parties..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex gap-2">
          {['all', 'customer', 'supplier', 'both'].map((t) => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize ${typeFilter === t ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><LuLoader className="w-6 h-6 animate-spin text-indigo-500" /><span className="ml-2 text-gray-500">Loading...</span></div>
        ) : parties.length === 0 ? (
          <div className="text-center py-20">
            <LuUsers className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">No parties found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first customer or supplier</p>
            <button onClick={() => { setEditingParty(null); setShowModal(true); }} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><LuPlus className="w-4 h-4 inline mr-1" /> Add Party</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">GSTIN</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-5 py-3">{typeBadge(p.type)}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.gstin || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{p.phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{p.city || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white tabnum">{formatCurrency(p.currentBalance || 0)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewParty(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuEye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingParty(p); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600"><LuPencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"><LuTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <Portal>
        <AnimatePresence>
          {viewParty && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewParty(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Party Details</h2>
                <button onClick={() => setViewParty(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                {[['Name', viewParty.name], ['Type', viewParty.type], ['GSTIN', viewParty.gstin || '—'], ['Phone', viewParty.phone || '—'],
                  ['Email', viewParty.email || '—'], ['Billing Address', viewParty.billingAddress || '—'], ['Shipping Address', viewParty.shippingAddress || '—'],
                  ['Opening Balance', formatCurrency(viewParty.openingBalance || 0)], ['Credit Limit', formatCurrency(viewParty.creditLimit || 0)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Delete Confirm */}
      <Portal>
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center">
              <LuTrash2 className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Party?</h3>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteParty.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">{deleteParty.isPending ? 'Deleting...' : 'Delete'}</button>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Add/Edit Modal */}
      <Portal>
        <AnimatePresence>
          {showModal && (
          <PartyFormModal party={editingParty} isSubmitting={createParty.isPending || updateParty.isPending} onSubmit={handleSubmit} onClose={() => { setShowModal(false); setEditingParty(null); }} />
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function PartyFormModal({ party, isSubmitting, onSubmit, onClose }: { party: Party | null; isSubmitting: boolean; onSubmit: (data: PartyFormData) => void; onClose: () => void; }) {
  const [form, setForm] = useState<PartyFormData>({
    name: party?.name || '', type: (party?.type as any) || 'customer', gstin: party?.gstin || '', phone: party?.phone || '',
    email: party?.email || '', billingAddress: party?.billingAddress || '', shippingAddress: party?.shippingAddress || '',
    isActive: party?.isActive ?? true,
  });
  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{party ? 'Edit Party' : 'Add Party'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Party Name *</label><input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
                <option value="customer">Customer</option><option value="supplier">Supplier</option><option value="both">Both</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN</label><input value={form.gstin} onChange={(e) => update('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label><textarea rows={2} value={form.billingAddress} onChange={(e) => update('billingAddress', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500 resize-none" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label><textarea rows={2} value={form.shippingAddress} onChange={(e) => update('shippingAddress', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500 resize-none" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <LuLoader className="w-4 h-4 animate-spin" />}{party ? 'Update' : 'Add Party'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
