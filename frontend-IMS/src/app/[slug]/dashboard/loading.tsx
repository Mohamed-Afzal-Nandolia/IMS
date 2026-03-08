import { LuLoader } from 'react-icons/lu';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/20 animate-pulse" />
        
        {/* Inner spinning loader */}
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <LuLoader className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      </div>
      
      <div className="mt-6 text-center space-y-2 translate-y-2 animate-pulse">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Loading module...
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Fetching latest data securely
        </p>
      </div>
    </div>
  );
}
