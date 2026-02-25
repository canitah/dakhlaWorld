import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/analytics — Platform stats with optional date filtering
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Parse optional date range from query params
        const { searchParams } = new URL(request.url);
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");

        const dateFilter: { created_at?: { gte?: Date; lte?: Date } } = {};
        if (fromStr) {
            dateFilter.created_at = { ...dateFilter.created_at, gte: new Date(fromStr) };
        }
        if (toStr) {
            const toDate = new Date(toStr);
            toDate.setHours(23, 59, 59, 999);
            dateFilter.created_at = { ...dateFilter.created_at, lte: toDate };
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
            prisma.user.count({ where: { role: "student", ...dateFilter } }),
            prisma.institutionProfile.count({ where: dateFilter }),
            prisma.institutionProfile.count({ where: { status: "pending", ...dateFilter } }),
            prisma.program.count({ where: { is_active: true, ...dateFilter } }),
            prisma.application.count({ where: dateFilter }),
            prisma.paymentRequest.count({ where: { status: "pending", ...dateFilter } }),
            prisma.paymentRequest.findMany({
                where: { status: "approved", ...dateFilter },
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
            where: dateFilter,
        });
        const applicationsByStatus: Record<string, number> = {};
        for (const a of appsByStatus) {
            applicationsByStatus[a.status] = a._count.status;
        }

        // ── Monthly trends (last 7 months): real data ──────────────────────
        const now = new Date();
        const monthlyTrends: { month: string; applications: number; users: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
            const monthLabel = start.toLocaleString("en-US", { month: "short" });

            const [appCount, userCount] = await Promise.all([
                prisma.application.count({ where: { created_at: { gte: start, lte: end } } }),
                prisma.user.count({ where: { created_at: { gte: start, lte: end } } }),
            ]);

            monthlyTrends.push({ month: monthLabel, applications: appCount, users: userCount });
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
            monthlyTrends,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
