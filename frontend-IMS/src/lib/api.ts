import axios from 'axios';

// Cache token at module level to avoid repeated localStorage reads per request
// rule: js-cache-storage — avoid reading storage APIs on every call
let cachedToken: string | null = null;

if (typeof window !== 'undefined') {
    cachedToken = localStorage.getItem('token');
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    if (cachedToken !== null) return cachedToken;
    cachedToken = localStorage.getItem('token');
    return cachedToken;
}

export function setToken(token: string) {
    cachedToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
}

export function clearToken() {
    cachedToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('ims_business_id');
    }
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor — attach JWT token (uses cached value)
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor — handle 401 unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
