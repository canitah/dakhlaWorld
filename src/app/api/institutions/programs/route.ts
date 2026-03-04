import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { programSchema } from "@/lib/validations";
import { getPlanTier, canActivateProgram } from "@/lib/plan-utils";

// Helper: get the institution's current approved plan name
async function getInstitutionPlanName(institutionId: number): Promise<string | null> {
    const pr = await prisma.paymentRequest.findFirst({
        where: { institution_id: institutionId, status: "approved" },
        include: { plan: true },
        orderBy: { updated_at: "desc" },
    });
    return pr?.plan?.name || null;
}

// GET /api/institutions/programs — List institution's programs
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const programs = await prisma.program.findMany({
            where: { institution_id: profile.id },
            include: {
                _count: { select: { applications: true } },
                questions: { select: { id: true, question: true, is_required: true } },
            },
            orderBy: { created_at: "desc" },
        });

        // Return plan info alongside programs for the frontend to show limits
        const planName = await getInstitutionPlanName(profile.id);
        const tier = getPlanTier(planName);
        const activeCount = programs.filter((p: any) => p.is_active).length;

        return NextResponse.json({
            programs,
            planInfo: {
                planName: tier.label,
                maxAdmissions: tier.maxAdmissions === Infinity ? -1 : tier.maxAdmissions,
                activeCount,
            },
        });
    } catch (error) {
        console.error("List institution programs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/institutions/programs — Create a new program
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Check if institution is approved
        if (profile.status !== "approved") {
            return NextResponse.json(
                { error: "Your institution must be approved before posting programs" },
                { status: 403 }
            );
        }

        // ── Admission limit enforcement ──
        const planName = await getInstitutionPlanName(profile.id);
        const tier = getPlanTier(planName);
        const activeCount = await prisma.program.count({
            where: { institution_id: profile.id, is_active: true },
        });

        if (!canActivateProgram(planName, activeCount)) {
            return NextResponse.json(
                {
                    error: `Your ${tier.label} plan allows only ${tier.maxAdmissions} active admissions. Please upgrade your plan to add more.`,
                    code: "ADMISSION_LIMIT_REACHED",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const parsed = programSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        // Generate unique 8-digit program code
        let programCode: string;
        let isUnique = false;
        do {
            const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
            programCode = `PRG-${digits}`;
            const existing = await prisma.program.findUnique({ where: { program_code: programCode } });
            isUnique = !existing;
        } while (!isUnique);

        const program = await prisma.program.create({
            data: {
                ...parsed.data,
                institution_id: profile.id,
                program_code: programCode,
                deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
            },
        });

        // Create questions if provided
        if (body.questions && Array.isArray(body.questions)) {
            const questionsData = body.questions
                .filter((q: any) => typeof q.question === "string" && q.question.trim())
                .map((q: any) => ({
                    program_id: program.id,
                    question: q.question.trim(),
                    is_required: q.is_required !== false,
                }));
            if (questionsData.length > 0) {
                await prisma.programQuestion.createMany({ data: questionsData });
            }
        }

        return NextResponse.json(
            { program, message: "Program created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
