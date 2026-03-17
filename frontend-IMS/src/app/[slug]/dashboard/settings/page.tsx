'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuSettings, LuBuilding2, LuUser, LuBell, LuShield, LuLoader, LuSave, LuPlus, LuX } from 'react-icons/lu';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const tabs = [
  { id: 'business', label: 'Business Profile', icon: LuBuilding2 },
  { id: 'invoice', label: 'Invoice Settings', icon: LuSettings },
  { id: 'notifications', label: 'Notifications', icon: LuBell },
  { id: 'templates', label: 'Product Templates', icon: LuPlus },
  { id: 'security', label: 'Security', icon: LuShield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Unified business state to match backend
  const [business, setBusiness] = useState({
    id: '', name: '', gstin: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
    bankName: '', accountNumber: '', ifscCode: '', upiId: '',
    invoicePrefix: 'INV', purchaseInvoicePrefix: 'PUR', skuPrefix: 'PROD', invoiceTerms: '', invoiceNotes: '',
    showBankDetails: true, showUpiQr: true, showDigitalSignature: true,
    lowStockAlert: true, newInvoiceAlert: true, paymentReceivedAlert: true, overdueInvoicesAlert: true,
    globalMinStockLevel: 5, salesInvoiceCounter: 1, purchaseInvoiceCounter: 1, skuCounter: 1,
    slug: '', isActive: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/business');
        if (data) {
          setBusiness(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (err) {
        console.error('Failed to fetch business settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateBusiness = (key: string, value: any) => setBusiness((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Send only config-related fields to avoid overwhelming the server
      const { 
        id, name, slug, gstin, phone, email, address, city, state, pincode, 
        bankName, accountNumber, ifscCode, upiId,
        invoicePrefix, purchaseInvoicePrefix, skuPrefix, invoiceTerms, invoiceNotes,
        showBankDetails, showUpiQr, showDigitalSignature,
        lowStockAlert, newInvoiceAlert, paymentReceivedAlert, overdueInvoicesAlert,
        globalMinStockLevel, salesInvoiceCounter, purchaseInvoiceCounter, skuCounter,
        isActive
      } = business;
      
      const payload = { 
        id, name, slug, gstin, phone, email, address, city, state, pincode, 
        bankName, accountNumber, ifscCode, upiId,
        invoicePrefix, purchaseInvoicePrefix, skuPrefix, invoiceTerms, invoiceNotes,
        showBankDetails, showUpiQr, showDigitalSignature,
        lowStockAlert, newInvoiceAlert, paymentReceivedAlert, overdueInvoicesAlert,
        globalMinStockLevel, salesInvoiceCounter, purchaseInvoiceCounter, skuCounter,
        isActive 
      };

      await api.put('/business', payload);
      addToast({ type: 'success', title: 'Settings Saved', message: 'Your business profile and preferences have been updated.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message || 'Could not save settings to the server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LuLoader className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-sm text-gray-500 mt-1">Manage your business configuration</p></div>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
          {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />} Save
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-6">
        {activeTab === 'business' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Business Name', key: 'name', placeholder: 'Your Business Name' },
                { label: 'GSTIN', key: 'gstin', placeholder: '22AAAAA0000A1Z5' },
                { label: 'Phone', key: 'phone', placeholder: '+91 9876543210' },
                { label: 'Email', key: 'email', placeholder: 'business@example.com' },
                { label: 'City', key: 'city', placeholder: 'Mumbai' },
                { label: 'State', key: 'state', placeholder: 'Maharashtra' },
                { label: 'Pincode', key: 'pincode', placeholder: '400001' },
              ].map((f) => (
                <div key={f.key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label><input value={(business as any)[f.key] || ''} onChange={(e) => updateBusiness(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
              ))}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><textarea rows={2} value={business.address || ''} onChange={(e) => updateBusiness('address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none resize-none" /></div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white pt-4">Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ label: 'Bank Name', key: 'bankName' }, { label: 'Account Number', key: 'accountNumber' }, { label: 'IFSC Code', key: 'ifscCode' }, { label: 'UPI ID', key: 'upiId' }].map((f) => (
                <div key={f.key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label><input value={(business as any)[f.key] || ''} onChange={(e) => updateBusiness(f.key, e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-indigo-500" /></div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice & SKU Configuration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Sales Prefix</label><input value={business.invoicePrefix || ''} onChange={(e) => updateBusiness('invoicePrefix', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Sales Next Number</label><input type="number" value={business.salesInvoiceCounter || 1} onChange={(e) => updateBusiness('salesInvoiceCounter', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Purchase Prefix</label><input value={business.purchaseInvoicePrefix || ''} onChange={(e) => updateBusiness('purchaseInvoicePrefix', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Purchase Next Number</label><input type="number" value={business.purchaseInvoiceCounter || 1} onChange={(e) => updateBusiness('purchaseInvoiceCounter', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">SKU Prefix</label><input value={business.skuPrefix || ''} onChange={(e) => updateBusiness('skuPrefix', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Terms & Conditions</label><textarea rows={3} value={business.invoiceTerms || ''} onChange={(e) => updateBusiness('invoiceTerms', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none resize-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Default Notes</label><textarea rows={2} value={business.invoiceNotes || ''} onChange={(e) => updateBusiness('invoiceNotes', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none resize-none" /></div>
            <div className="space-y-3 pt-2">
              {[{ label: 'Show Bank Details', key: 'showBankDetails' }, { label: 'Show UPI QR', key: 'showUpiQr' }, { label: 'Show Digital Signature', key: 'showDigitalSignature' }].map((t) => (
                <label key={t.key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
                  <button onClick={() => updateBusiness(t.key, !(business as any)[t.key])} className={`w-10 h-6 rounded-full transition-colors ${(business as any)[t.key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${(business as any)[t.key] ? 'translate-x-4' : ''}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 mb-6">
              <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Global Minimum Stock Level</label>
              <div className="flex items-center gap-4">
                <input type="number" min="0" value={business.globalMinStockLevel || 0} onChange={(e) => updateBusiness('globalMinStockLevel', Number(e.target.value))} className="w-24 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-sm outline-none" />
                <p className="text-xs text-indigo-600 dark:text-indigo-400">Default alert level for all products without an individual setting.</p>
              </div>
            </div>

            {[{ label: 'Low Stock Alerts', key: 'lowStockAlert', desc: 'Get notified when products go below minimum stock' },
              { label: 'New Invoice', key: 'newInvoiceAlert', desc: 'Notification when a new invoice is created' },
              { label: 'Payment Received', key: 'paymentReceivedAlert', desc: 'Alert when a payment is recorded' },
              { label: 'Overdue Invoices', key: 'overdueInvoicesAlert', desc: 'Reminder for unpaid overdue invoices' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/50">
                <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">{n.label}</p><p className="text-xs text-gray-400">{n.desc}</p></div>
                <button onClick={() => updateBusiness(n.key, !(business as any)[n.key])} className={`w-10 h-6 rounded-full transition-colors ${(business as any)[n.key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${(business as any)[n.key] ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <ProductTemplatesSection />
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <p className="text-sm text-gray-500">Your account security is managed through IMS Pro authentication. Use the user menu (top-right) to manage your profile and sign out.</p>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">OAuth Providers Enabled</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Google, GitHub</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

import { useProductTemplates, useCreateProductTemplate, useUpdateProductTemplate, useDeleteProductTemplate } from '@/hooks/useProductTemplates';
import { LuPlus as LuPlusIcon, LuTrash2 as LuTrashIcon } from 'react-icons/lu';

function ProductTemplatesSection() {
  const { data: templates, isLoading } = useProductTemplates();
  const createTemplate = useCreateProductTemplate();
  const updateTemplate = useUpdateProductTemplate();
  const deleteTemplate = useDeleteProductTemplate();
  const { addToast } = useToast();

  const [newTemplateName, setNewTemplateName] = useState('');

  const handleAddValue = async (templateId: string, template: any) => {
    const val = prompt('Enter new value (e.g. Red, XL, Cotton):');
    if (!val) return;
    
    const updatedValues = [...(template.values || []), { value: val }];
    try {
      await updateTemplate.mutateAsync({ id: templateId, values: updatedValues as any });
      addToast({ type: 'success', title: 'Value Added' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleRemoveValue = async (templateId: string, template: any, valueId: string) => {
    const updatedValues = (template.values || []).filter((v: any) => v.id !== valueId);
    try {
      await updateTemplate.mutateAsync({ id: templateId, values: updatedValues as any });
      addToast({ type: 'success', title: 'Value Removed' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleCreate = async () => {
    if (!newTemplateName) return;
    try {
      await createTemplate.mutateAsync({ name: newTemplateName, values: [] });
      setNewTemplateName('');
      addToast({ type: 'success', title: 'Template Created' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (isLoading) return <div className="py-10 flex justify-center"><LuLoader className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Product Templates</h2>
        <p className="text-sm text-gray-500 mb-4">Define master attributes like Sizes, Colors, or Materials to use in product entries.</p>
        
        <div className="flex gap-2 mb-8">
          <input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="New Template (e.g. Size)" className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" />
          <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
            <LuPlusIcon className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(templates || []).map((t) => (
            <div key={t.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white capitalize">{t.name}</h3>
                <button onClick={() => deleteTemplate.mutate(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <LuTrashIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(t.values || []).map((v) => (
                  <span key={v.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
                    {v.value}
                    <button onClick={() => handleRemoveValue(t.id, t, v.id)} className="hover:text-red-500 transition-colors">
                      <LuX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={() => handleAddValue(t.id, t)} className="px-2.5 py-1 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-xs text-indigo-600 font-medium hover:border-indigo-400 transition-all">
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

