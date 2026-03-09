'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens as clearApiTokens, setTokens as setApiTokens } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    businessId: string | null;
    businessSlug: string | null;
    role: string | null;
    isLoading: boolean;
    login: (token: string, businessId: string, slug?: string, role?: string, refreshToken?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessSlug, setBusinessSlug] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('ims_refresh_token');
        const storedBusinessId = localStorage.getItem('ims_business_id');
        const storedSlug = localStorage.getItem('ims_business_slug');
        const storedRole = localStorage.getItem('ims_user_role');
        if (storedToken && storedBusinessId) {
            setApiTokens(storedToken, storedRefreshToken || undefined);
            setToken(storedToken);
            setBusinessId(storedBusinessId);
            if (storedSlug) setBusinessSlug(storedSlug);
            if (storedRole) setRole(storedRole);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newBusinessId: string, slug?: string, newRole?: string, refreshToken?: string) => {
        setApiTokens(newToken, refreshToken);
        if (newBusinessId) localStorage.setItem('ims_business_id', newBusinessId);
        if (slug) localStorage.setItem('ims_business_slug', slug);
        if (newRole) localStorage.setItem('ims_user_role', newRole);
        
        setToken(newToken);
        setBusinessId(newBusinessId);
        setBusinessSlug(slug || null);
        setRole(newRole || null);
        setIsAuthenticated(true);
    };

    const logout = () => {
        clearApiTokens();
        
        setToken(null);
        setBusinessId(null);
        setBusinessSlug(null);
        setRole(null);
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, businessId, businessSlug, role, isLoading, login, logout }}>
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
