"use client";

import { cn } from "@/lib/utils";

const PLAN_BADGE_CONFIG: Record<string, {
    label: string;
    icon: string;
    gradient: string;
    textColor: string;
    borderColor: string;
    glowColor: string;
}> = {
    Starter: {
        label: "Starter",
        icon: "🛡️",
        gradient: "from-slate-500/20 to-slate-600/20",
        textColor: "text-slate-600 dark:text-slate-400",
        borderColor: "border-slate-300 dark:border-slate-600",
        glowColor: "",
    },
    Growth: {
        label: "Growth",
        icon: "🚀",
        gradient: "from-blue-500/20 to-cyan-500/20",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-600",
        glowColor: "shadow-blue-500/20",
    },
    Pro: {
        label: "Pro",
        icon: "⚡",
        gradient: "from-purple-500/20 to-pink-500/20",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-300 dark:border-purple-600",
        glowColor: "shadow-purple-500/20",
    },
    Featured: {
        label: "Featured",
        icon: "👑",
        gradient: "from-amber-500/20 to-orange-500/20",
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-300 dark:border-amber-600",
        glowColor: "shadow-amber-500/20",
    },
};

interface PlanBadgeProps {
    planName: string | null | undefined;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function PlanBadge({ planName, size = "sm", className }: PlanBadgeProps) {
    if (!planName || planName === "Starter") return null;

    const config = PLAN_BADGE_CONFIG[planName];
    if (!config) return null;

    const sizeClasses = {
        sm: "text-[10px] px-2 py-0.5 gap-1",
        md: "text-xs px-2.5 py-1 gap-1.5",
        lg: "text-sm px-3 py-1.5 gap-1.5",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold uppercase tracking-wider rounded-full border",
                `bg-gradient-to-r ${config.gradient}`,
                config.textColor,
                config.borderColor,
                config.glowColor && `shadow-md ${config.glowColor}`,
                sizeClasses[size],
                className
            )}
        >
            <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}>
                {config.icon}
            </span>
            {config.label}
        </span>
    );
}

// Compact badge for sidebar (icon-only when collapsed)
export function PlanBadgeCompact({ planName, collapsed }: { planName: string | null | undefined; collapsed?: boolean }) {
    if (!planName || planName === "Starter") return null;

    const config = PLAN_BADGE_CONFIG[planName];
    if (!config) return null;

    if (collapsed) {
        return (
            <span
                className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full border text-xs",
                    `bg-gradient-to-r ${config.gradient}`,
                    config.borderColor,
                    config.glowColor && `shadow-sm ${config.glowColor}`
                )}
                title={`${planName} Plan`}
            >
                {config.icon}
            </span>
        );
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5",
                `bg-gradient-to-r ${config.gradient}`,
                config.textColor,
                config.borderColor,
                config.glowColor && `shadow-sm ${config.glowColor}`
            )}
        >
            <span className="text-xs">{config.icon}</span>
            {planName}
        </span>
    );
}
