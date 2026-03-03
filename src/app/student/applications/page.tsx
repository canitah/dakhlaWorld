"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";

interface Application {
    id: number;
    application_code: string;
    status: string;
    created_at: string;
    program: {
        title: string;
        category: string | null;
        institution: { name: string; city: string | null };
    };
}

export default function StudentApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackingCode, setTrackingCode] = useState("");
    const [trackingResult, setTrackingResult] = useState<Application | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        async function load() {
            const res = await fetchWithAuth("/applications");
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications);
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const handleTrack = async () => {
        if (!trackingCode.trim()) return;
        setIsTracking(true);
        setTrackingError(null);
        setTrackingResult(null);

        try {
            const res = await fetchWithAuth(`/applications/track?code=${encodeURIComponent(trackingCode.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setTrackingResult(data.application);
            } else {
                const data = await res.json();
                setTrackingError(data.error || "Application not found");
            }
        } catch {
            setTrackingError("Failed to track application");
        } finally {
            setIsTracking(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <h1 className="text-2xl font-bold mb-6">My Applications</h1>

            {/* Track Application by Code */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Search className="size-4" />
                        Track Application
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-center">
                        <Input
                            placeholder="Enter application code (e.g., APP-12345678)"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                            className="max-w-sm"
                        />
                        <button
                            onClick={handleTrack}
                            disabled={isTracking || !trackingCode.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                        >
                            {isTracking ? "Tracking..." : "Track"}
                        </button>
                    </div>

                    {trackingResult && (
                        <div className="mt-4 p-4 rounded-lg border border-border bg-accent/30">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="size-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">{trackingResult.application_code}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground font-medium">Program:</span>
                                    <p className="text-foreground">{trackingResult.program.title}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Institution:</span>
                                    <p className="text-foreground">{trackingResult.program.institution.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Status:</span>
                                    <div className="mt-0.5"><StatusBadge status={trackingResult.status} /></div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Applied:</span>
                                    <p className="text-foreground">{new Date(trackingResult.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {trackingError && (
                        <p className="mt-3 text-sm text-destructive">{trackingError}</p>
                    )}
                </CardContent>
            </Card>

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p className="text-lg mb-2">No applications yet</p>
                        <p className="text-sm">Visit the Explore page to find and apply to programs.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Applications ({applications.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Application Code</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Institution</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="py-3">
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {app.application_code}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-sm font-medium">{app.program.title}</td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {app.program.institution.name}
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {app.program.category || "—"}
                                            </td>
                                            <td className="py-3">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </DashboardLayout>
    );
}
