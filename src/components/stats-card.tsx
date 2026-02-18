import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: string;
    className?: string;
    trend?: string;
}

export function StatsCard({ title, value, icon, className, trend }: StatsCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm transition-all hover:shadow-md",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>
                    )}
                </div>
                {icon && <span className="text-3xl opacity-80">{icon}</span>}
            </div>
        </div>
    );
}

export function StatusBadge({
    status,
}: {
    status: string;
}) {
    const variants: Record<string, string> = {
        submitted: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800",
        viewed: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800",
        accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
        rejected: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800",
        pending: "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800",
        approved: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
        active: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
        suspended: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize",
                variants[status] || "bg-muted text-muted-foreground border-border"
            )}
        >
            {status}
        </span>
    );
}
