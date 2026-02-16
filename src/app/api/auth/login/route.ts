import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    setRefreshCookie,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

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
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
