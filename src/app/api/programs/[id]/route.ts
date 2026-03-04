import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/programs/[id] — Get program detail
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const programId = parseInt(id);

        if (isNaN(programId)) {
            return NextResponse.json({ error: "Invalid program ID" }, { status: 400 });
        }

        const program = await prisma.program.findUnique({
            where: { id: programId },
            include: {
                institution: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        category: true,
                        description: true,
                        contact_email: true,
                    },
                },
                questions: {
                    select: { id: true, question: true, is_required: true },
                    orderBy: { id: "asc" as const },
                },
                _count: { select: { applications: true } },
            },
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
