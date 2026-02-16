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
                "rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-emerald-600 mt-1">{trend}</p>
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
        submitted: "bg-blue-50 text-blue-700 border-blue-200",
        viewed: "bg-amber-50 text-amber-700 border-amber-200",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        pending: "bg-orange-50 text-orange-700 border-orange-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        suspended: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize",
                variants[status] || "bg-gray-50 text-gray-700 border-gray-200"
            )}
        >
            {status}
        </span>
    );
}
