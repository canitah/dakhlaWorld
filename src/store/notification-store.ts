"use client";

import { create } from "zustand";

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    link: string | null;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isOpen: boolean;

    setNotifications: (notifications: Notification[], unreadCount: number) => void;
    setOpen: (open: boolean) => void;
    markAsRead: (id: number) => void;
    markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,

    setNotifications: (notifications, unreadCount) =>
        set({ notifications, unreadCount }),

    setOpen: (isOpen) => set({ isOpen }),

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),

    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
            unreadCount: 0,
        })),
}));
