import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { User } from '@/domain/auth/models/user.model';
import type { IAuthRepository, LoginInput, RegisterInput } from '@/domain/auth/repositories/auth.repository.interface';
import { AuthRepositoryImpl } from '@/infrastructure/auth/auth.repository.impl';

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

// Dependency Injection could be done via Context or Factory, 
// but for simple Zustand usage, instantiating here is acceptable or passing via props/init.
const authRepository: IAuthRepository = new AuthRepositoryImpl();

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
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    toast.success(`Welcome back, ${response.user.firstName}!`);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({
                        error: message,
                        isLoading: false
                    });
                    toast.error(message);
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await authRepository.register(data);
                    // Optionally auto-login or require explicit login
                    // For now just finish loading
                    set({ isLoading: false });
                    toast.success('Account created successfully! Please login.');
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({
                        error: message,
                        isLoading: false
                    });
                    toast.error(message);
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                authRepository.logout();
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const user = await authRepository.getProfile();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            resetError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // Persist only necessary fields
        }
    )
);
