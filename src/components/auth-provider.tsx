"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Toast import karein

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

                    // 🚨 CHECK: Agar status 403 (Blocked) hai
                    if (meRes.status === 403) {
                        toast.error("Your account has been blocked. Please contact admin.");
                        logout(); // Ye store se user clear kar dega
                        router.push("/login");
                        return;
                    }

                    if (meRes.ok) {
                        const { user } = await meRes.json();
                        // Extract profile_picture_url and display_name from the profile
                        const profilePicUrl =
                            user.student_profile?.profile_picture_url ||
                            user.institution_profile?.profile_picture_url ||
                            null;
                        const displayName =
                            user.institution_profile?.name ||
                            user.student_profile?.full_name ||
                            null;
                        setAuth(
                            { ...user, profile_picture_url: profilePicUrl, display_name: displayName },
                            accessToken
                        );
                        return;
                    }
                }

                logout();
            } catch (error) {
                console.error("Auth init error:", error);
                logout();
            } finally {
                setLoading(false); // Ensure loading is turned off
            }
        }

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}
