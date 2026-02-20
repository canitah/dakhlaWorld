"use client";

import { create } from "zustand";

interface User {
    id: number;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    profile_picture_url?: string | null;
    display_name?: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    setAuth: (user: User, accessToken: string) => void;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setProfilePicture: (url: string) => void;
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

    setProfilePicture: (url) =>
        set((state) => ({
            user: state.user ? { ...state.user, profile_picture_url: url } : null,
        })),

    logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

    setLoading: (isLoading) => set({ isLoading }),
}));
