'use client';

import { useAuth } from '@/contexts/AuthContext';

export function SignedIn({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return null;
    return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return null;
    return <>{children}</>;
}

export function UserButton() {
    const { logout } = useAuth();
    return (
        <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"
        >
            Sign Out
        </button>
    );
}
