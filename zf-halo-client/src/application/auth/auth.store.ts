import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { User } from '@/domain/auth/models/user.model';
import type { IAuthRepository, LoginInput, RegisterInput } from '@/domain/auth/repositories/auth.repository.interface';
import { AuthRepositoryImpl } from '@/infrastructure/auth/auth.repository.impl';
import { updateCachedToken } from '@/infrastructure/http/client';
import { isAxiosError } from 'axios';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (credentials: LoginInput) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    resetError: () => void;
}

const authRepository: IAuthRepository = new AuthRepositoryImpl();

function extractErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        return (error.response?.data as { message?: string })?.message ?? fallback;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authRepository.login(credentials);
                    updateCachedToken(response.token);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    toast.success(`Welcome back, ${response.user.firstName}!`);
                } catch (error: unknown) {
                    const message = extractErrorMessage(error, 'Login failed');
                    set({ error: message, isLoading: false });
                    toast.error(message);
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await authRepository.register(data);
                    set({ isLoading: false });
                    toast.success('Account created successfully! Please login.');
                } catch (error: unknown) {
                    const message = extractErrorMessage(error, 'Registration failed');
                    set({ error: message, isLoading: false });
                    toast.error(message);
                    throw error;
                }
            },

            logout: () => {
                updateCachedToken(null);
                set({ user: null, token: null, isAuthenticated: false });
                authRepository.logout();
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const user = await authRepository.getProfile();
                    set({ user, isAuthenticated: true });
                } catch {
                    updateCachedToken(null);
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            resetError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

