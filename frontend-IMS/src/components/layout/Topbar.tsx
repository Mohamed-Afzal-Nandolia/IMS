'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { SignedIn } from '@/components/auth/AuthComponents';
import { LuSun, LuMoon, LuBell, LuSearch, LuMenu, LuBuilding2, LuSettings, LuLogOut } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentBusiness } = useBusiness();
  const { logout } = useAuth();
  const router = useRouter();
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LuMenu className="w-5 h-5" />
        </button>

        {/* Search */}
        <motion.div
          animate={{ width: searchFocused ? 320 : 240 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent focus-within:border-indigo-300 dark:focus-within:border-indigo-600 transition-colors"
        >
          <LuSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, invoices..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200 dark:bg-gray-700 rounded">
            ⌘K
          </kbd>
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'light' ? <LuMoon className="w-5 h-5" /> : <LuSun className="w-5 h-5" />}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
        >
          <LuBell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* User Menu */}
        <SignedIn>
          <div className="relative ml-1">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 transition-colors text-indigo-700 dark:text-indigo-300 text-sm font-medium shadow-sm"
            >
              <LuBuilding2 className="w-4 h-4" />
              <span className="max-w-[150px] truncate">{currentBusiness?.name || '...'}</span>
            </button>
            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 min-w-full w-max bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 focus:outline-none z-50 overflow-hidden origin-top-right"
                  >
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); router.push(`/${currentBusiness?.slug || 'dashboard'}/dashboard/settings`); }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LuSettings className="w-4 h-4 text-gray-400" /> Settings
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />
                      <button
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                      >
                       <LuLogOut className="w-4 h-4 text-red-500/70" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
