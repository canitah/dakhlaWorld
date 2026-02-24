import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/institutions/[id] — Public institution detail (for students)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require authentication (any role)
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const institutionId = parseInt(id, 10);
        if (isNaN(institutionId)) {
            return NextResponse.json({ error: "Invalid institution ID" }, { status: 400 });
        }

        const institution = await prisma.institutionProfile.findUnique({
            where: { id: institutionId },
            select: {
                id: true,
                name: true,
                category: true,
                city: true,
                description: true,
                contact_email: true,
                profile_picture_url: true,
                status: true,
                created_at: true,
                programs: {
                    where: { is_active: true },
                    select: {
                        id: true,
                        program_code: true,
                        title: true,
                        category: true,
                        duration: true,
                        eligibility: true,
                        deadline: true,
                        application_method: true,
                        external_url: true,
                        created_at: true,
                    },
                    orderBy: { created_at: "desc" },
                },
                _count: { select: { programs: { where: { is_active: true } } } },
            },
        });

        if (!institution || institution.status !== "approved") {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        return NextResponse.json({ institution });
    } catch (error) {
        console.error("Get institution detail error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
