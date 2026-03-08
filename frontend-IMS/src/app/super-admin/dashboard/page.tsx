'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LuPlus, LuUsers, LuSearch, LuLoader, LuLogOut, LuBuilding, LuCheck, LuCopy, LuShieldCheck, LuInfo, LuActivity, LuX } from 'react-icons/lu';

export default function SuperAdminDashboard() {
  const { role, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ businessName: '', slug: '', adminEmail: '', adminPassword: '', phone: '', gstin: '' });
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardSuccessData, setOnboardSuccessData] = useState<any>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    
    // Basic gatekeeping on the client just in case middleware is bypassed
    if (role !== 'ROLE_SUPER_ADMIN') {
      router.push('/super-admin/login');
      return;
    }
    fetchBusinesses();
  }, [role, isAuthLoading, router]);

  const fetchBusinesses = async () => {
    try {
      const { data } = await api.get('/super-admin/businesses');
      setBusinesses(data);
    } catch (err) {
      console.error('Failed to fetch businesses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardLoading(true);
    try {
      const { data } = await api.post('/super-admin/businesses', onboardForm);
      setBusinesses([...businesses, data]);
      setOnboardSuccessData(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to onboard client');
    } finally {
      setOnboardLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this client? They will ${currentStatus ? 'lose' : 'regain'} access.`)) return;
    try {
      const { data } = await api.patch(`/super-admin/businesses/${id}/toggle-active`);
      setBusinesses(businesses.map(b => b.id === id ? data : b));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle status');
    }
  };

  const copyCredentials = () => {
    if (!onboardSuccessData) return;
    const text = `IMS Login Details\nURL: https://yourapp.com/${onboardSuccessData.slug}/dashboard\nEmail: ${onboardSuccessData.adminEmail}\nPassword: ${onboardSuccessData.generatedPassword}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase()) || 
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isAuthLoading || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LuLoader className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LuShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">IMS Command Center</h1>
            <p className="text-xs text-gray-500 font-medium">Super Admin Console</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2">
          <LuLogOut className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuBuilding className="w-6 h-6 text-indigo-500" /> Clients Management
            </h2>
            <p className="text-gray-500 mt-1">Manage onboarded businesses, tenants, and their access.</p>
          </div>
          <button onClick={() => { setIsModalOpen(true); setOnboardSuccessData(null); setOnboardForm({ businessName: '', slug: '', adminEmail: '', adminPassword: '', phone: '', gstin: '' }); }} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
            <LuPlus className="w-5 h-5" /> Onboard New Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><LuUsers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
            <div><p className="text-sm text-gray-500 font-medium truncate">Total Clients</p><p className="text-2xl font-bold mt-0.5">{businesses.length}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><LuActivity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-sm text-gray-500 font-medium truncate">Active Instances</p><p className="text-2xl font-bold mt-0.5">{businesses.filter(b => b.active).length}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><LuInfo className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-sm text-gray-500 font-medium truncate">Suspended</p><p className="text-2xl font-bold mt-0.5">{businesses.filter(b => !b.active).length}</p></div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="relative max-w-sm">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search businesses, slugs, or emails..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 font-semibold">Business</th>
                  <th className="px-6 py-4 font-semibold">Slug (URL Route)</th>
                  <th className="px-6 py-4 font-semibold">Admin Email</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {b.name}
                      <div className="text-xs text-gray-500 mt-1 font-normal">Created {new Date(b.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs text-gray-600 dark:text-gray-300">/{b.slug}/dashboard</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{b.adminEmail}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${b.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                        {b.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleActive(b.id, b.active)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${b.active ? 'text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/30' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-900/30'}`}>
                        {b.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBusinesses.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No businesses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {onboardSuccessData ? 'Client Onboarded Successfully' : 'Onboard New Client'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {onboardSuccessData ? 'Please save these credentials securely. The password is only shown once.' : 'Enter the business details to provision a new tenant.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {onboardSuccessData ? (
                  <div className="space-y-5">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-4">
                      <LuCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Tenant Ready</h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Workspace created and admin assigned.</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
                      <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Login URL / Route</p><p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">/{onboardSuccessData.slug}/dashboard</p></div>
                      <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Admin Email</p><p className="font-medium text-sm text-gray-900 dark:text-white">{onboardSuccessData.adminEmail}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Admin Password</p><p className="font-mono text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-400 p-2 rounded border border-amber-200 dark:border-amber-800 break-all">{onboardSuccessData.generatedPassword}</p></div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={copyCredentials} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"><LuCopy className="w-4 h-4" /> Copy Details</button>
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-colors">Done</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOnboardSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Name *</label>
                      <input required type="text" value={onboardForm.businessName} onChange={e => setOnboardForm({...onboardForm, businessName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800" placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">URL Slug <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                      <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all overflow-hidden">
                        <span className="pl-3 pr-1 py-2 text-gray-500 flex-shrink-0 text-sm border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pointer-events-none self-center">yourapp.com/</span>
                        <input type="text" value={onboardForm.slug} onChange={e => setOnboardForm({...onboardForm, slug: e.target.value})} className="flex-1 w-full px-3 py-2 bg-transparent outline-none font-mono text-sm min-w-[50px]" placeholder="acmecorp" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Email *</label>
                        <input required type="email" value={onboardForm.adminEmail} onChange={e => setOnboardForm({...onboardForm, adminEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800" placeholder="admin@acme.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">Password <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                        <input type="text" value={onboardForm.adminPassword} onChange={e => setOnboardForm({...onboardForm, adminPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800" placeholder="Auto-generated" />
                      </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                      <button type="submit" disabled={onboardLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2">
                        {onboardLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : 'Provision Tenant'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
