"use client";

import { useAuthStore } from "@/store/auth-store";
import { useCallback } from "react";

const API_BASE = "/api";

export function useApi() {
    const { accessToken, setToken, logout } = useAuthStore();

    const fetchWithAuth = useCallback(
        async (url: string, options: RequestInit = {}) => {
            const headers: Record<string, string> = {
                ...(options.headers as Record<string, string>),
            };

            if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            }

            // Don't set Content-Type for FormData (for file uploads)
            if (!(options.body instanceof FormData)) {
                headers["Content-Type"] = "application/json";
            }

            let response = await fetch(`${API_BASE}${url}`, {
                ...options,
                headers,
            });

            // If 401, try to refresh token
            if (response.status === 401) {
                const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                    method: "POST",
                });

                if (refreshRes.ok) {
                    const { accessToken: newToken } = await refreshRes.json();
                    setToken(newToken);
                    headers["Authorization"] = `Bearer ${newToken}`;
                    response = await fetch(`${API_BASE}${url}`, {
                        ...options,
                        headers,
                    });
                } else {
                    logout();
                    window.location.href = "/login";
                    throw new Error("Session expired");
                }
            }

            return response;
        },
        [accessToken, setToken, logout]
    );

    return { fetchWithAuth };
}
