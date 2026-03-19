'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@/components/auth/AuthComponents';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LuBox,
  LuShield,
  LuChartBar,
  LuIndianRupee,
  LuUsers,
  LuFileText,
  LuArrowRight,
  LuCheck,
} from 'react-icons/lu';

const features = [
  { icon: LuBox, title: 'Inventory Management', desc: 'Track stock, batches, expiry & multi-warehouse' },
  { icon: LuFileText, title: 'GST Invoicing', desc: 'CGST/SGST/IGST auto-calculation & e-invoice ready' },
  { icon: LuChartBar, title: 'Real-time Analytics', desc: 'Sales trends, profit analysis & smart reports' },
  { icon: LuIndianRupee, title: 'Accounting', desc: 'P&L, balance sheet, ledger & payment tracking' },
  { icon: LuUsers, title: 'Party Management', desc: 'Customer & supplier tracking with receivables' },
  { icon: LuShield, title: 'Secure & Multi-tenant', desc: 'Role-based access with multi-business support' },
];

export default function LandingPage() {
  const router = useRouter();
  const { businessSlug } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <LuBox className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600">
            IMS Pro
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/login?tab=register">
              <button className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all">
                Get Started Free
              </button>
            </Link>
          </SignedOut>
          <SignedIn>
            <button
              onClick={() => router.push(`/${businessSlug || 'default'}/dashboard`)}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              Go to Dashboard <LuArrowRight className="w-4 h-4" />
            </button>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <LuIndianRupee className="w-4 h-4" />
            100% GST Compliant
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Manage Your Business{' '}
            <span className="text-indigo-600">
              Smarter
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            All-in-one inventory, billing, GST & accounting platform designed for Indian businesses.
            Fast, modern, and incredibly easy to use.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
              <Link href="/login?tab=register">
                <button className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                  Start Free Trial <LuArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => router.push(`/${businessSlug || 'default'}/dashboard`)}
                className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                Open Dashboard <LuArrowRight className="w-5 h-5" />
              </button>
            </SignedIn>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            {['No credit card required', 'Free forever for small businesses', 'Data stored in India'].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <LuCheck className="w-4 h-4 text-emerald-500" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need to Run Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <p className="text-sm text-gray-500">© 2026 IMS Pro. Built for Indian Businesses.</p>
          <p className="text-sm text-gray-400">Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
}
