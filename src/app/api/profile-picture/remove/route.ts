import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function DELETE(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student", "institution"]);
        if ("error" in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { userId, role } = authResult.user;

        if (role === "student") {
            await prisma.$executeRaw`
                UPDATE student_profiles SET profile_picture_url = NULL WHERE user_id = ${userId}
            `;
        } else if (role === "institution") {
            await prisma.$executeRaw`
                UPDATE institution_profiles SET profile_picture_url = NULL WHERE user_id = ${userId}
            `;
        }

        return NextResponse.json({ message: "Profile picture removed" });
    } catch (error) {
        console.error("Remove profile picture error:", error);
        return NextResponse.json(
            { error: "Failed to remove profile picture" },
            { status: 500 }
        );
    }
}
