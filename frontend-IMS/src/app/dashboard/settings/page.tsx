'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuSettings, LuBuilding2, LuUser, LuBell, LuShield, LuLoader, LuSave } from 'react-icons/lu';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const tabs = [
  { id: 'business', label: 'Business Profile', icon: LuBuilding2 },
  { id: 'invoice', label: 'Invoice Settings', icon: LuSettings },
  { id: 'notifications', label: 'Notifications', icon: LuBell },
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
    invoicePrefix: 'INV', invoiceTerms: '', invoiceNotes: '',
    showBankDetails: true, showUpiQr: true, showDigitalSignature: true,
    lowStockAlert: true, newInvoiceAlert: true, paymentReceivedAlert: true, overdueInvoicesAlert: true,
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
      await api.put('/business', business);
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Configuration</h2>
            <div><label className="block text-sm font-medium mb-1">Invoice Prefix</label><input value={business.invoicePrefix || ''} onChange={(e) => updateBusiness('invoicePrefix', e.target.value)} className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none" /></div>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
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
