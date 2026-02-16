import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { otpSchema } from "@/lib/validations";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = otpSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { userId, code } = parsed.data;

        // Find valid OTP
        const otp = await prisma.otpToken.findFirst({
            where: {
                user_id: userId,
                code,
                used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: "desc" },
        });

        if (!otp) {
            return NextResponse.json(
                { error: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        // Mark OTP as used
        await prisma.otpToken.update({
            where: { id: otp.id },
            data: { used: true },
        });

        // Activate user account
        await prisma.user.update({
            where: { id: userId },
            data: { status: "active" },
        });

        return NextResponse.json({
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
