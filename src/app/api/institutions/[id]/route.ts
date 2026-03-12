import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/institutions/[id] — Institution detail (for students)
// Supports lookup by unique_id first, then falls back to numeric id
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

        const selectFields = {
            id: true,
            name: true,
            category: true,
            city: true,
            description: true,
            contact_email: true,
            profile_picture_url: true,
            status: true,
            created_at: true,
            current_plan: { select: { name: true } },
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
                orderBy: { created_at: "desc" as const },
            },
            _count: { select: { programs: { where: { is_active: true } } } },
        };

        let institution = null;

        // Try unique_id lookup first
        const user = await prisma.user.findUnique({
            where: { unique_id: id },
            select: { id: true, institution_profile: { select: { id: true } } },
        });
        if (user?.institution_profile) {
            institution = await prisma.institutionProfile.findUnique({
                where: { id: user.institution_profile.id },
                select: selectFields,
            });
        }

        // Fall back to numeric id
        if (!institution) {
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                institution = await prisma.institutionProfile.findUnique({
                    where: { id: numericId },
                    select: selectFields,
                });
            }
        }

        if (!institution || institution.status !== "approved") {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        return NextResponse.json({ institution });
    } catch (error) {
        console.error("Get institution detail error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
