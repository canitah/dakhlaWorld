import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/programs/[id] — Get program detail
// Supports lookup by program_code first, then falls back to numeric id
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const includeFields = {
            institution: {
                select: {
                    id: true,
                    name: true,
                    city: true,
                    category: true,
                    description: true,
                    contact_email: true,
                    user: { select: { unique_id: true } },
                },
            },
            questions: {
                select: { id: true, question: true, is_required: true },
                orderBy: { id: "asc" as const },
            },
            _count: { select: { applications: true } },
        };

        // Try program_code first
        let program = await prisma.program.findUnique({
            where: { program_code: id },
            include: includeFields,
        });

        // Fall back to numeric id
        if (!program) {
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                program = await prisma.program.findUnique({
                    where: { id: numericId },
                    include: includeFields,
                });
            }
        }

        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Handle admin-posted programs (no institution)
        if ((program as any).posted_by_admin || !program.institution) {
            const mapped = {
                ...program,
                postedByPlatform: true,
                institution: {
                    id: 0,
                    name: "DAKHLA Platform",
                    city: null,
                    category: null,
                    description: null,
                    contact_email: null,
                    uniqueId: "platform",
                },
            };
            return NextResponse.json({ program: mapped });
        }

        // Flatten user.unique_id into institution.uniqueId
        const { user, ...institutionRest } = program.institution as any;
        const mapped = {
            ...program,
            postedByPlatform: false,
            institution: {
                ...institutionRest,
                uniqueId: user?.unique_id || String(institutionRest.id),
            },
        };

        return NextResponse.json({ program: mapped });
    } catch (error) {
        console.error("Get program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// --- PATCH: Admin Edit Logic (Sirf ye hissa add karen) ---
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if ID is numeric or a code
        let whereCondition: any = { program_code: id };
        const numericId = parseInt(id, 10);
        if (!isNaN(numericId)) {
            whereCondition = { id: numericId };
        }

        const updatedProgram = await prisma.program.update({
            where: whereCondition,
            data: {
                title: body.title,
                category: body.category,
                duration: body.duration,
                fee: body.fee,
                description: body.description,
                eligibility: body.eligibility,
                study_field: body.study_field,
                is_active: body.is_active,
                deadline: body.deadline ? new Date(body.deadline) : null,
            },
        });

        return NextResponse.json({ message: "Updated", updatedProgram });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}