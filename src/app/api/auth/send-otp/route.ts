import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOtpEmail, generateOtp } from "@/lib/mail";
import { sendOtpSchema } from "@/lib/validations";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = sendOtpSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, type } = parsed.data;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email" },
                { status: 404 }
            );
        }

        // Generate OTP
        const code = generateOtp();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Invalidate previous OTPs
        await prisma.otpToken.updateMany({
            where: { user_id: user.id, used: false },
            data: { used: true },
        });

        // Save new OTP
        await prisma.otpToken.create({
            data: {
                user_id: user.id,
                code,
                type,
                expires_at,
            },
        });

        // Send email
        await sendOtpEmail(email, code);

        return NextResponse.json({
            message: "OTP sent successfully",
            userId: user.id,
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
