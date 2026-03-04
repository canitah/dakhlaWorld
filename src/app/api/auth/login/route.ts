import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    setRefreshCookie,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { sendInstitutionWelcomeEmail } from "@/lib/mail";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, phone, password } = parsed.data;

        // Find user by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(phone ? [{ phone }] : []),
                ],
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check if email is verified (pending = OTP not yet confirmed)
        if (user.status === "pending") {
            return NextResponse.json(
                { error: "Please verify your email before logging in. Check your inbox for the verification code." },
                { status: 403 }
            );
        }

        // Check if account is suspended
        if (user.status === "suspended") {
            return NextResponse.json(
                { error: "Your account has been suspended" },
                { status: 403 }
            );
        }

        // Generate tokens
        const tokenPayload = { userId: user.id, role: user.role, email: user.email || undefined };
        const accessToken = await generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(tokenPayload);

        await setRefreshCookie(refreshToken);

        // Send institution welcome/pending email only once (first login after signup)
        if (user.role === "institution" && user.email) {
            const instProfile = await prisma.institutionProfile.findUnique({
                where: { user_id: user.id },
                select: { welcome_sent: true },
            });
            if (instProfile && !instProfile.welcome_sent) {
                sendInstitutionWelcomeEmail(user.email, user.email).catch(() => { });
                prisma.institutionProfile.update({
                    where: { user_id: user.id },
                    data: { welcome_sent: true },
                }).catch(() => { });
            }
        }

        // Check institution profile completeness for redirect
        let profileComplete = true;
        if (user.role === "institution") {
            const instProfile = await prisma.institutionProfile.findUnique({
                where: { user_id: user.id },
                select: { name: true, category: true, city: true, contact_email: true, description: true },
            });
            if (instProfile) {
                const requiredFields = [instProfile.name, instProfile.category, instProfile.city, instProfile.contact_email, instProfile.description];
                profileComplete = requiredFields.every(f => f !== null && f !== undefined && String(f).trim() !== "");
            } else {
                profileComplete = false;
            }
        }

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            },
            accessToken,
            profileComplete,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
