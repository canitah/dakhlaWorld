import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { programSchema } from "@/lib/validations";

// GET /api/admin/programs — List admin-posted programs
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const programs = await prisma.program.findMany({
            where: { posted_by_admin: true },
            include: {
                _count: { select: { applications: true } },
                questions: { select: { id: true, question: true, is_required: true } },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ programs });
    } catch (error) {
        console.error("List admin programs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/programs — Create a new admin-posted program
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = programSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        // Generate unique program code
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
                institution_id: null,
                posted_by_admin: true,
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
        console.error("Create admin program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
