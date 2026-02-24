import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { programSchema } from "@/lib/validations";

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
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ programs });
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

        return NextResponse.json(
            { program, message: "Program created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
