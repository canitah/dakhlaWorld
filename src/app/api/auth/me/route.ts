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
// ✅ NEW: Blocked User Check
        if (user.status === "blocked") {
            const response = NextResponse.json(
                { error: "Your account is blocked. Contact admin." },
                { status: 403 }
            );

            // 🍪 Cookies clear karein takay session khatam ho jaye
            response.cookies.delete("access_token");
            // Agar aapka refresh token cookie ka naam 'refresh_token' hai toh wo bhi delete karein
            response.cookies.set("access_token", "", { expires: new Date(0) }); 

            return response;
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
