import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlanRank } from "@/lib/plan-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const scheduleType = searchParams.get("schedule_type") || "";
    const company = searchParams.get("company") || "";
    const datePosted = searchParams.get("date_posted") || "";

    const feeMin = searchParams.get("fee_min")
      ? parseInt(searchParams.get("fee_min")!)
      : null;

    const feeMax = searchParams.get("fee_max")
      ? parseInt(searchParams.get("fee_max")!)
      : null;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = {
      is_active: true,
      OR: [
        { institution: { status: "approved" } },
        { posted_by_admin: true },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { institute_name: { contains: search, mode: "insensitive" } },
            { study_field: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (category) where.category = category;
    if (scheduleType) where.schedule_type = scheduleType;

    if (city || company) {
      where.institution = {
        status: "approved",
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(company && { name: { contains: company, mode: "insensitive" } }),
      };
    }

    if (feeMin !== null || feeMax !== null) {
      where.fee = {
        ...(feeMin !== null && { gte: feeMin }),
        ...(feeMax !== null && { lte: feeMax }),
      };
    }

    if (datePosted) {
      const now = new Date();
      let sinceDate: Date | null = null;

      if (datePosted === "today")
        sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (datePosted === "3days")
        sinceDate = new Date(now.getTime() - 3 * 86400000);
      else if (datePosted === "7days")
        sinceDate = new Date(now.getTime() - 7 * 86400000);
      else if (datePosted === "14days")
        sinceDate = new Date(now.getTime() - 14 * 86400000);

      if (sinceDate) where.created_at = { gte: sinceDate };
    }

    const fetchFilters = page === 1;

    // ✅ Fetch paginated data directly from DB
    const [programsRaw, total, ...filterResults] = await Promise.all([
      prisma.program.findMany({
        where,
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              city: true,
              category: true,
              profile_picture_url: true,
              user: { select: { unique_id: true } },
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
        orderBy: {
          created_at: "desc", // base sort
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.program.count({ where }),

      ...(fetchFilters
        ? [
            prisma.program.findMany({
              where: { is_active: true },
              select: { category: true },
              distinct: ["category"],
            }),
            prisma.institutionProfile.findMany({
              where: { status: "approved" },
              select: { city: true },
              distinct: ["city"],
            }),
            prisma.institutionProfile.findMany({
              where: { status: "approved" },
              select: { name: true },
              take: 50,
              orderBy: { name: "asc" },
            }),
            prisma.program.findMany({
              where: { is_active: true },
              select: { schedule_type: true },
              distinct: ["schedule_type"],
            }),
          ]
        : []),
    ]);

    // ✅ Apply plan-based sorting ONLY on current page (safe)
    const sortedPrograms = programsRaw.sort((a: any, b: any) => {
      const rankA = a.institution?.payment_requests?.[0]?.plan?.name
        ? getPlanRank(a.institution.payment_requests[0].plan.name)
        : a.posted_by_admin
        ? 10
        : 0;

      const rankB = b.institution?.payment_requests?.[0]?.plan?.name
        ? getPlanRank(b.institution.payment_requests[0].plan.name)
        : b.posted_by_admin
        ? 10
        : 0;

      if (rankB !== rankA) return rankB - rankA;

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });

    // ✅ NO slicing here anymore
    const programs = sortedPrograms.map((p: any) => ({
      id: p.id,
      title: p.title,
      institute_name:
        p.institute_name || p.institution?.name || "DAKHLA Platform",
      category: p.category,
      duration: p.duration,
      deadline: p.deadline,
      fee: p.fee,
      schedule_type: p.schedule_type,
      study_field: p.study_field,

      description: p.description,
      eligibility: p.eligibility,
      application_method: p.application_method,
      external_url: p.external_url,
      program_code: p.program_code,

      created_at: p.created_at,
      postedByPlatform: p.posted_by_admin || !p.institution,

      institution: p.institution
        ? {
            id: p.institution.id,
            name: p.institution.name,
            city: p.institution.city,
            profilePicture: p.institution.profile_picture_url,
            description: p.institution.description,
            contact_email: p.institution.contact_email,
            uniqueId:
              p.institution.user?.unique_id ||
              String(p.institution.id),
            planTier:
              p.institution.payment_requests[0]?.plan?.name ||
              "Starter",
          }
        : {
            id: 0,
            name: "DAKHLA Platform",
            city: "Online/Global",
            uniqueId: "admin",
            planTier: "Premium",
          },

      applicants: p._count?.applications || 0,
    }));

    return NextResponse.json({
      programs,
      filters: fetchFilters
        ? {
            categories:
              filterResults[0]?.map((c: any) => c.category).filter(Boolean) ||
              [],
            cities:
              filterResults[1]?.map((c: any) => c.city).filter(Boolean) || [],
            companies:
              filterResults[2]?.map((i: any) => i.name).filter(Boolean) || [],
            scheduleTypes:
              filterResults[3]
                ?.map((s: any) => s.schedule_type)
                .filter(Boolean) || [],
          }
        : null,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Public API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}