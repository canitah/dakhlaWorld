import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    hashPassword,
    generateAccessToken,
    generateRefreshToken,
    setRefreshCookie,
} from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = signupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, phone, password, role } = parsed.data;

        // Check if user already exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(phone ? [{ phone }] : []),
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email or phone already exists" },
                { status: 409 }
            );
        }

        const password_hash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email || null,
                phone: phone || null,
                password_hash,
                role,
                status: "pending", // needs OTP verification
            },
        });

        // Create corresponding profile
        if (role === "student") {
            await prisma.studentProfile.create({
                data: { user_id: user.id },
            });
        } else if (role === "institution") {
            await prisma.institutionProfile.create({
                data: {
                    user_id: user.id,
                    name: email || phone || "New Institution",
                    status: "pending", // needs admin approval
                },
            });
        }

        // Generate tokens
        const tokenPayload = { userId: user.id, role: user.role, email: user.email || undefined };
        const accessToken = await generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(tokenPayload);

        await setRefreshCookie(refreshToken);

        return NextResponse.json(
            {
                message: "Account created successfully. Please verify your email.",
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                },
                accessToken,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
