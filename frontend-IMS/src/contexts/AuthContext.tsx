'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    businessId: string | null;
    login: (token: string, businessId: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedBusinessId = localStorage.getItem('ims_business_id');
        if (storedToken && storedBusinessId) {
            setToken(storedToken);
            setBusinessId(storedBusinessId);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (newToken: string, newBusinessId: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('ims_business_id', newBusinessId);
        setToken(newToken);
        setBusinessId(newBusinessId);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('ims_business_id');
        setToken(null);
        setBusinessId(null);
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, businessId, login, logout }}>
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
