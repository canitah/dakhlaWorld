import { NextResponse } from "next/server";
import {
    getRefreshCookie,
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    setRefreshCookie,
} from "@/lib/auth";

export async function POST() {
    try {
        const refreshToken = await getRefreshCookie();

        if (!refreshToken) {
            return NextResponse.json(
                { error: "No refresh token" },
                { status: 401 }
            );
        }

        const payload = await verifyRefreshToken(refreshToken);
        if (!payload) {
            return NextResponse.json(
                { error: "Invalid or expired refresh token" },
                { status: 401 }
            );
        }

        // Rotate tokens
        const newAccessToken = await generateAccessToken({
            userId: payload.userId,
            role: payload.role,
            email: payload.email,
        });
        const newRefreshToken = await generateRefreshToken({
            userId: payload.userId,
            role: payload.role,
            email: payload.email,
        });

        await setRefreshCookie(newRefreshToken);

        return NextResponse.json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error("Refresh error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
