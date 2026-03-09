import axios from 'axios';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'ims_refresh_token';
const BUSINESS_ID_KEY = 'ims_business_id';
const BUSINESS_SLUG_KEY = 'ims_business_slug';
const USER_ROLE_KEY = 'ims_user_role';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

if (typeof window !== 'undefined') {
    cachedAccessToken = localStorage.getItem(TOKEN_KEY);
    cachedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
}

function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    if (cachedAccessToken !== null) return cachedAccessToken;
    cachedAccessToken = localStorage.getItem(TOKEN_KEY);
    return cachedAccessToken;
}

function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    if (cachedRefreshToken !== null) return cachedRefreshToken;
    cachedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return cachedRefreshToken;
}

export function setToken(token: string) {
    cachedAccessToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

export function setRefreshToken(refreshToken: string) {
    cachedRefreshToken = refreshToken;
    if (typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function setTokens(token: string, refreshToken?: string) {
    setToken(token);
    if (refreshToken) {
        setRefreshToken(refreshToken);
    }
}

export function clearTokens() {
    cachedAccessToken = null;
    cachedRefreshToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(BUSINESS_ID_KEY);
        localStorage.removeItem(BUSINESS_SLUG_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
    }
}

async function requestTokenRefresh(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const nextAccessToken = data?.token as string | undefined;
        const nextRefreshToken = data?.refreshToken as string | undefined;

        if (!nextAccessToken || !nextRefreshToken) {
            throw new Error('Refresh response missing token data');
        }

        setTokens(nextAccessToken, nextRefreshToken);
        if (data?.businessId) localStorage.setItem(BUSINESS_ID_KEY, data.businessId);
        if (data?.businessSlug) localStorage.setItem(BUSINESS_SLUG_KEY, data.businessSlug);
        if (data?.role) localStorage.setItem(USER_ROLE_KEY, data.role);

        return nextAccessToken;
    } catch {
        clearTokens();
        return null;
    }
}

function redirectToLogin() {
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
        const requestUrl = originalRequest?.url || '';

        const isAuthEndpoint =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/refresh') ||
            requestUrl.includes('/super-admin/auth/login');

        if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
            if (status === 401 && isAuthEndpoint) {
                clearTokens();
            }
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshPromise) {
            refreshPromise = requestTokenRefresh().finally(() => {
                refreshPromise = null;
            });
        }

        const nextToken = await refreshPromise;
        if (!nextToken) {
            redirectToLogin();
            return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
    }
);

export default api;
