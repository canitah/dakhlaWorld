import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, code, password } = await request.json();

        if (!email || !code || !password) {
            return NextResponse.json(
                { error: "Email, verification code, and new password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or verification code" },
                { status: 400 }
            );
        }

        // Find valid OTP
        const otpToken = await prisma.otpToken.findFirst({
            where: {
                user_id: user.id,
                code,
                type: "password_reset",
                used: false,
                expires_at: { gte: new Date() },
            },
            orderBy: { created_at: "desc" },
        });

        if (!otpToken) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Mark OTP as used
        await prisma.otpToken.update({
            where: { id: otpToken.id },
            data: { used: true },
        });

        // Hash new password and update user
        const password_hash = await hashPassword(password);
        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash },
        });

        return NextResponse.json({
            message: "Password reset successfully. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
