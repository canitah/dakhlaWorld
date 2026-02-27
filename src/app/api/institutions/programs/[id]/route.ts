import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { programSchema } from "@/lib/validations";
import { canActivateProgram, getPlanTier } from "@/lib/plan-utils";

// Helper: get the institution's current approved plan name
async function getInstitutionPlanName(institutionId: number): Promise<string | null> {
    const pr = await prisma.paymentRequest.findFirst({
        where: { institution_id: institutionId, status: "approved" },
        include: { plan: true },
        orderBy: { updated_at: "desc" },
    });
    return pr?.plan?.name || null;
}

// GET /api/institutions/programs/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        const program = await prisma.program.findFirst({
            where: { id: parseInt(id), institution_id: profile!.id },
            include: { _count: { select: { applications: true } } },
        });

        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        return NextResponse.json({ program });
    } catch (error) {
        console.error("Get program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/institutions/programs/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = programSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        const existing = await prisma.program.findFirst({
            where: { id: parseInt(id), institution_id: profile!.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // ── Admission limit check when activating a program ──
        if (parsed.data.is_active === true && !existing.is_active) {
            const planName = await getInstitutionPlanName(profile!.id);
            const tier = getPlanTier(planName);
            const activeCount = await prisma.program.count({
                where: { institution_id: profile!.id, is_active: true },
            });

            if (!canActivateProgram(planName, activeCount)) {
                return NextResponse.json(
                    {
                        error: `Your ${tier.label} plan allows only ${tier.maxAdmissions} active admissions. Please upgrade your plan.`,
                        code: "ADMISSION_LIMIT_REACHED",
                    },
                    { status: 403 }
                );
            }
        }

        const program = await prisma.program.update({
            where: { id: parseInt(id) },
            data: {
                ...parsed.data,
                deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
            },
        });

        return NextResponse.json({ program, message: "Program updated successfully" });
    } catch (error) {
        console.error("Update program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/institutions/programs/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        const existing = await prisma.program.findFirst({
            where: { id: parseInt(id), institution_id: profile!.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        await prisma.program.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: "Program deleted successfully" });
    } catch (error) {
        console.error("Delete program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
