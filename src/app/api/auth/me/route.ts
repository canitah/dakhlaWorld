import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: authResult.user.userId },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                created_at: true,
                student_profile: true,
                institution_profile: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Get me error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
