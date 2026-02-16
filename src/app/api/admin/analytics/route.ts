import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/analytics — Platform stats
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const [
            totalStudents,
            totalInstitutions,
            pendingInstitutions,
            totalPrograms,
            totalApplications,
            pendingPayments,
            approvedPayments,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "student" } }),
            prisma.institutionProfile.count(),
            prisma.institutionProfile.count({ where: { status: "pending" } }),
            prisma.program.count({ where: { is_active: true } }),
            prisma.application.count(),
            prisma.paymentRequest.count({ where: { status: "pending" } }),
            prisma.paymentRequest.findMany({
                where: { status: "approved" },
                include: { plan: true },
            }),
        ]);

        // Calculate total revenue from approved payments
        const totalRevenue = approvedPayments.reduce(
            (acc: number, pr: { plan: { price_pkr: number } }) => acc + pr.plan.price_pkr,
            0
        );

        const totalUsers = totalStudents + totalInstitutions;

        // Application breakdown by status
        const appsByStatus = await prisma.application.groupBy({
            by: ["status"],
            _count: { status: true },
        });
        const applicationsByStatus: Record<string, number> = {};
        for (const a of appsByStatus) {
            applicationsByStatus[a.status] = a._count.status;
        }

        return NextResponse.json({
            totalUsers,
            totalStudents,
            totalInstitutions,
            pendingInstitutions,
            totalPrograms,
            totalApplications,
            pendingPayments,
            totalRevenue,
            applicationsByStatus,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
