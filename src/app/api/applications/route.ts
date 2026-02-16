import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { applicationSchema } from "@/lib/validations";
import { sendApplicationSubmittedEmail } from "@/lib/mail";

// GET /api/applications — List student's applications
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const applications = await prisma.application.findMany({
            where: { student_id: profile.id },
            include: {
                program: {
                    include: {
                        institution: {
                            select: { id: true, name: true, city: true },
                        },
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("List applications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/applications — Apply to a program (with duplicate prevention)
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = applicationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
        }

        // Check program exists and is active
        const program = await prisma.program.findUnique({
            where: { id: parsed.data.program_id },
            include: {
                institution: {
                    select: { id: true, name: true, user_id: true },
                },
            },
        });

        if (!program || !program.is_active) {
            return NextResponse.json({ error: "Program not found or inactive" }, { status: 404 });
        }

        // Check duplicate application
        const existing = await prisma.application.findUnique({
            where: {
                program_id_student_id: {
                    program_id: parsed.data.program_id,
                    student_id: profile.id,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "You have already applied to this program" },
                { status: 409 }
            );
        }

        const application = await prisma.application.create({
            data: {
                program_id: parsed.data.program_id,
                student_id: profile.id,
                status: "submitted",
            },
            include: {
                program: {
                    include: {
                        institution: { select: { name: true } },
                    },
                },
            },
        });

        // Send confirmation email to student (fire-and-forget)
        const studentUser = await prisma.user.findUnique({
            where: { id: authResult.user.userId },
            select: { email: true },
        });

        if (studentUser?.email) {
            sendApplicationSubmittedEmail(
                studentUser.email,
                program.title,
                program.institution.name
            ).catch(() => { });
        }

        // Create in-app notification for the institution
        await prisma.notification.create({
            data: {
                user_id: program.institution.user_id,
                title: "New Application Received",
                message: `A student has applied to your program "${program.title}".`,
                type: "application_submitted",
                link: "/institution/applications",
            },
        });

        return NextResponse.json(
            { application, message: "Application submitted successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create application error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
