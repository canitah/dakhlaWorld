// Plan tier configuration and helper functions
// Used across backend (API enforcement) and can be imported by frontend utilities

export interface PlanTierConfig {
    rank: number;           // 0=Starter, 1=Growth, 2=Pro, 3=Featured — used for sorting
    maxAdmissions: number;  // max active programs allowed (Infinity for unlimited)
    highlighted: boolean;   // whether program cards get premium styling
    homeFeatured: "none" | "rotational" | "fixed";
    label: string;          // display name
    color: string;          // accent color for UI badges
}

export const PLAN_TIERS: Record<string, PlanTierConfig> = {
    Starter: {
        rank: 0,
        maxAdmissions: 2,
        highlighted: false,
        homeFeatured: "none",
        label: "Starter",
        color: "#6b7280", // gray
    },
    Growth: {
        rank: 1,
        maxAdmissions: 12,  // 2 free + 10 growth
        highlighted: true,
        homeFeatured: "none",
        label: "Growth",
        color: "#3b82f6", // blue
    },
    Pro: {
        rank: 2,
        maxAdmissions: 22,  // 2 free + 20 pro
        highlighted: true,
        homeFeatured: "rotational",
        label: "Pro",
        color: "#8b5cf6", // purple
    },
    Featured: {
        rank: 3,
        maxAdmissions: Infinity,
        highlighted: true,
        homeFeatured: "fixed",
        label: "Featured",
        color: "#f59e0b", // amber/gold
    },
};

// Get plan tier config. Defaults to Starter if plan name not found.
export function getPlanTier(planName: string | null | undefined): PlanTierConfig {
    if (!planName) return PLAN_TIERS.Starter;
    // Match by exact name or partial match (e.g. "Growth Plan" → "Growth")
    const key = Object.keys(PLAN_TIERS).find(
        (k) => planName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? PLAN_TIERS[key] : PLAN_TIERS.Starter;
}

// Get numeric rank for sorting (higher = better plan)
export function getPlanRank(planName: string | null | undefined): number {
    return getPlanTier(planName).rank;
}

// Check if an institution can activate more programs
export function canActivateProgram(planName: string | null | undefined, currentActiveCount: number): boolean {
    const tier = getPlanTier(planName);
    return currentActiveCount < tier.maxAdmissions;
}
