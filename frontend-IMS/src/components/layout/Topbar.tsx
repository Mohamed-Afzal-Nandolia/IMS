'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { UserButton, SignedIn } from '@insforge/nextjs';
import { LuSun, LuMoon, LuBell, LuSearch, LuMenu, LuBuilding2 } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentBusiness } = useBusiness();
  const [searchFocused, setSearchFocused] = useState(false);

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
        {/* Business selector */}
        {currentBusiness && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            <LuBuilding2 className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{currentBusiness.name}</span>
          </div>
        )}

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

        {/* User */}
        <SignedIn>
          <div className="ml-1">
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
