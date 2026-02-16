"use client";

import { create } from "zustand";

interface User {
    id: number;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    setAuth: (user: User, accessToken: string) => void;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isLoading: false }),

    setUser: (user) => set({ user }),

    setToken: (accessToken) => set({ accessToken }),

    logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

    setLoading: (isLoading) => set({ isLoading }),
}));
