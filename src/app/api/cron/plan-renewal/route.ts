import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPlanRenewalReminderEmail } from "@/lib/mail";

// GET /api/cron/plan-renewal — Process plan renewals & send reminders
// This endpoint can be called by a cron job scheduler (e.g. Vercel Cron, external scheduler)
export async function GET(request: Request) {
    try {
        // Optional: protect with a secret key
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        if (secret !== (process.env.CRON_SECRET || "gap-cron-secret")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // 1. Send reminder emails to institutions whose plans expire within 3 days
        const expiringInstitutions = await prisma.institutionProfile.findMany({
            where: {
                plan_expires_at: {
                    gt: now,
                    lte: threeDaysFromNow,
                },
                current_plan_id: { not: null },
            },
            include: {
                user: true,
                current_plan: true,
            },
        });

        let reminders = 0;
        for (const inst of expiringInstitutions) {
            if (inst.user.email && inst.current_plan) {
                await sendPlanRenewalReminderEmail(
                    inst.user.email,
                    inst.name,
                    inst.current_plan.name,
                    inst.plan_expires_at!.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                );
                reminders++;
            }
        }

        // 2. Handle expired plans
        const expiredInstitutions = await prisma.institutionProfile.findMany({
            where: {
                plan_expires_at: { lte: now },
                current_plan_id: { not: null },
            },
            include: {
                current_plan: true,
            },
        });

        let renewed = 0;
        let downgraded = 0;

        for (const inst of expiredInstitutions) {
            if (inst.auto_renew && inst.current_plan) {
                // Auto-renew: create a new pending payment request and extend plan for 30 days
                const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                await prisma.paymentRequest.create({
                    data: {
                        institution_id: inst.id,
                        plan_id: inst.current_plan_id!,
                        status: "pending",
                        transaction_ref: `AUTO-RENEW-${Date.now()}`,
                    },
                });
                // Extend plan temporarily while payment is pending
                await prisma.institutionProfile.update({
                    where: { id: inst.id },
                    data: { plan_expires_at: newExpiry },
                });
                renewed++;
            } else {
                // No auto-renew: downgrade to Starter (free plan)
                const starterPlan = await prisma.paymentPlan.findUnique({ where: { name: "Starter" } });
                await prisma.institutionProfile.update({
                    where: { id: inst.id },
                    data: {
                        current_plan_id: starterPlan?.id || null,
                        plan_expires_at: null,
                    },
                });
                downgraded++;
            }
        }

        return NextResponse.json({
            message: "Plan renewal cron completed",
            reminders_sent: reminders,
            auto_renewed: renewed,
            downgraded_to_starter: downgraded,
        });
    } catch (error) {
        console.error("Plan renewal cron error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
