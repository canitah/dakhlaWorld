import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { studentProfileSchema } from "@/lib/validations";

// GET /api/students/profile — Get current student's profile
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
            include: { user: { select: { email: true, phone: true, status: true } } },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Get student profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/students/profile — Update student profile
export async function PUT(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = studentProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.studentProfile.update({
            where: { user_id: authResult.user.userId },
            data: parsed.data,
        });

        return NextResponse.json({ profile, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update student profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
