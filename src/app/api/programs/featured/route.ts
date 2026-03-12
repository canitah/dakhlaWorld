import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/programs/featured — Public endpoint for homepage featured programs
// Returns Featured-tier programs (fixed slots) and Pro-tier programs (rotational random subset)
export async function GET() {
    try {
        // Get all active programs from approved institutions that have a paid plan
        const programs = await prisma.program.findMany({
            where: {
                is_active: true,
                institution: {
                    status: "approved",
                    payment_requests: {
                        some: { status: "approved" },
                    },
                },
            },
            include: {
                institution: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        category: true,
                        profile_picture_url: true,
                        payment_requests: {
                            where: { status: "approved" },
                            include: { plan: true },
                            orderBy: { updated_at: "desc" },
                            take: 1,
                        },
                    },
                },
                _count: { select: { applications: true } },
            },
        });

        // Separate by tier
        const featured: typeof programs = [];
        const pro: typeof programs = [];

        for (const p of programs) {
            const planName = p.institution?.payment_requests[0]?.plan?.name || "";
            if (planName.toLowerCase().includes("featured")) {
                featured.push(p);
            } else if (planName.toLowerCase().includes("pro")) {
                pro.push(p);
            }
        }

        // Rotational: pick random 3 from Pro tier
        const shuffled = pro.sort(() => Math.random() - 0.5);
        const rotational = shuffled.slice(0, 3);

        // Map to clean response
        const mapProgram = (p: (typeof programs)[0]) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            duration: p.duration,
            deadline: p.deadline,
            created_at: p.created_at,
            institution: {
                id: p.institution?.id,
                name: p.institution?.name,
                city: p.institution?.city,
                category: p.institution?.category,
                profilePicture: p.institution?.profile_picture_url,
                planTier: p.institution?.payment_requests[0]?.plan?.name || "Starter",
            },
            applicants: p._count.applications,
        });

        return NextResponse.json({
            featured: featured.map(mapProgram),
            rotational: rotational.map(mapProgram),
        });
    } catch (error) {
        console.error("Featured programs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
