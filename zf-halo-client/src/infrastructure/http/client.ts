import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
// import { useAuthStore } from '@/application/auth/auth.store'; 
// Store depends on Repository, Repository depends on Axios.
// Axios interceptor needs Store token.
// Solution: Access store via `useAuthStore.getState()` inside interceptor, imported lazily or direct.
// Better: `useAuthStore` is Application layer. `client.ts` is Infra layer.
// Infra shouldn't depend on Application layer directly ideally, but for token injection it's common pragmatic pattern in frontend.
// Alternative: Inject token provider or callback.

// For simplicity and effectiveness in React apps:
// We will look up the token from localStorage directly or use the store's getState().

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // We need to avoid circular dependency effectively.
        // Reading from localStorage is potential "Infra" concern anyway.
        // But the store persists to 'auth-storage'.

        try {
            const storage = localStorage.getItem('auth-storage');
            if (storage) {
                const parsed = JSON.parse(storage);
                const token = parsed.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error reading token from storage', error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (maybe redirect or clear store)
            // Ideally dispatch a logout action, but we don't want strict coupling here if possible.
            // For now, just reject.
        }
        return Promise.reject(error);
    }
);
