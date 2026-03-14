'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { clearTokens as clearApiTokens, setTokens as setApiTokens, MODULES_KEY } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    businessId: string | null;
    businessSlug: string | null;
    role: string | null;
    enabledModules: string[];
    isLoading: boolean;
    login: (token: string, businessId: string, slug?: string, role?: string, refreshToken?: string, enabledModules?: string[]) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessSlug, setBusinessSlug] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [enabledModules, setEnabledModules] = useState<string[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('ims_refresh_token');
        const storedBusinessId = localStorage.getItem('ims_business_id');
        const storedSlug = localStorage.getItem('ims_business_slug');
        const storedRole = localStorage.getItem('ims_user_role');
        const storedModules = localStorage.getItem(MODULES_KEY);
        if (storedToken && storedBusinessId) {
            setApiTokens(storedToken, storedRefreshToken || undefined);
            setToken(storedToken);
            setBusinessId(storedBusinessId);
            if (storedSlug) setBusinessSlug(storedSlug);
            if (storedRole) setRole(storedRole);
            if (storedModules) {
                try { setEnabledModules(JSON.parse(storedModules)); } catch { setEnabledModules([]); }
            }
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newBusinessId: string, slug?: string, newRole?: string, refreshToken?: string, modules?: string[]) => {
        setApiTokens(newToken, refreshToken);
        if (newBusinessId) localStorage.setItem('ims_business_id', newBusinessId);
        if (slug) localStorage.setItem('ims_business_slug', slug);
        if (newRole) localStorage.setItem('ims_user_role', newRole);
        const moduleList = modules ?? [];
        localStorage.setItem(MODULES_KEY, JSON.stringify(moduleList));

        setToken(newToken);
        setBusinessId(newBusinessId);
        setBusinessSlug(slug || null);
        setRole(newRole || null);
        setEnabledModules(moduleList);
        setIsAuthenticated(true);
    };

    const logout = () => {
        clearApiTokens();
        queryClient.clear();

        setToken(null);
        setBusinessId(null);
        setBusinessSlug(null);
        setRole(null);
        setEnabledModules([]);
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, businessId, businessSlug, role, enabledModules, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
