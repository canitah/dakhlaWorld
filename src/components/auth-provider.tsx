"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAuth, setLoading, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        async function initAuth() {
            try {
                // Try to refresh token on app load
                const res = await fetch("/api/auth/refresh", { method: "POST" });

                if (res.ok) {
                    const { accessToken } = await res.json();

                    // Get user data
                    const meRes = await fetch("/api/auth/me", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    if (meRes.ok) {
                        const { user } = await meRes.json();
                        setAuth(user, accessToken);
                        return;
                    }
                }

                logout();
            } catch {
                logout();
            }
        }

        initAuth();
    }, [setAuth, setLoading, logout, router]);

    return <>{children}</>;
}
