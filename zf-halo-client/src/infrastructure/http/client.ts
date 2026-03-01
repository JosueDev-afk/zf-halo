import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cache token to avoid parsing localStorage on every request (js-cache-storage)
let cachedToken: string | null = null;

export function updateCachedToken(token: string | null) {
  cachedToken = token;
}

// Initialize token from localStorage on module load
try {
  const storage = localStorage.getItem("auth-storage");
  if (storage) {
    const parsed = JSON.parse(storage);
    cachedToken = parsed.state?.token ?? null;
  }
} catch {
  // Ignore parse errors
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear cached token and auth storage
      cachedToken = null;
      try {
        localStorage.removeItem("auth-storage");
      } catch {
        // Ignore storage errors
      }
      // Redirect to login unless already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
