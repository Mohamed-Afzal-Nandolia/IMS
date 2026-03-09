'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { LuShieldCheck, LuArrowRight, LuLoader, LuMail, LuLock } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

function SuperAdminAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login, isAuthenticated, role, isLoading: isAuthLoading, businessSlug } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      if (role === 'ROLE_SUPER_ADMIN') {
        router.replace('/super-admin/dashboard');
      } else if (businessSlug) {
        router.replace(`/${businessSlug}/dashboard`);
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isAuthLoading, role, businessSlug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/super-admin/auth/login', { email, password });
      // The API returns role='ROLE_SUPER_ADMIN' and businessSlug='superadmin'
      login(data.token, data.businessId || 'superadmin', data.businessSlug, data.role, data.refreshToken);
      router.push('/super-admin/dashboard');
    } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 401) {
            setError("Invalid super admin credentials or access denied.");
        } else {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
        <LuLoader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-800 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
            <LuShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Super Admin Space</h2>
          <p className="text-sm text-gray-400">Restricted access area. Please identify yourself.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-sm bg-red-900/20 p-4 rounded-xl border border-red-800/50">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative group">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder:text-gray-600"
                placeholder="Super Admin Email"
              />
            </div>

            <div className="relative group">
              <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder:text-gray-600"
                placeholder="Admin Passphrase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            {loading ? <LuLoader className="w-5 h-5 animate-spin" /> : (
              <>
                Authenticate <LuArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function SuperAdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-950"><LuLoader className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <SuperAdminAuthForm />
    </Suspense>
  );
}
