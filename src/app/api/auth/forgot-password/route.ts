import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtp, sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase().trim() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: "If an account with that email exists, a verification code has been sent.",
            });
        }

        // Check if account is suspended
        if (user.status === "suspended") {
            return NextResponse.json({
                message: "If an account with that email exists, a verification code has been sent.",
            });
        }

        // Invalidate previous password reset OTPs
        await prisma.otpToken.updateMany({
            where: { user_id: user.id, type: "password_reset", used: false },
            data: { used: true },
        });

        // Generate and store new OTP
        const code = generateOtp();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.otpToken.create({
            data: {
                user_id: user.id,
                code,
                type: "password_reset",
                expires_at,
            },
        });

        // Send email
        await sendPasswordResetEmail(email, code);

        return NextResponse.json({
            message: "If an account with that email exists, a verification code has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
