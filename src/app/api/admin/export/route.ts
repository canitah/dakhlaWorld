import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/export — Export platform data as CSV
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

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

        const applications = await prisma.application.findMany({
            where: dateFilter,
            include: {
                student: {
                    select: {
                        full_name: true,
                        city: true,
                        education_level: true,
                        user: { select: { email: true } },
                    },
                },
                program: {
                    select: {
                        title: true,
                        category: true,
                        institution: { select: { name: true } },
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        // Build CSV
        const headers = ["ID", "Student Name", "Student Email", "City", "Education", "Program", "Category", "Institution", "Status", "Date"];
        const rows = applications.map((app: any) => [
            app.id,
            app.student?.full_name || "",
            app.student?.user?.email || "",
            app.student?.city || "",
            app.student?.education_level || "",
            app.program?.title || "",
            app.program?.category || "",
            app.program?.institution?.name || "",
            app.status,
            new Date(app.created_at).toISOString().split("T")[0],
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="gap-admin-export-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
