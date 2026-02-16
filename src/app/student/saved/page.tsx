"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SavedItem {
    id: number;
    program: {
        id: number;
        title: string;
        category: string | null;
        institution: { name: string; city: string | null };
    };
}

export default function SavedProgramsPage() {
    const { fetchWithAuth } = useApi();
    const [saved, setSaved] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSaved();
    }, []);

    async function loadSaved() {
        const res = await fetchWithAuth("/saved");
        if (res.ok) {
            const data = await res.json();
            setSaved(data.saved);
        }
        setIsLoading(false);
    }

    const handleUnsave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) {
            toast.success("Program removed from saved");
            loadSaved();
        }
    };

    const handleApply = async (programId: number) => {
        const res = await fetchWithAuth("/applications", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Application submitted!");
        } else {
            toast.error(data.error);
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
            <h1 className="text-2xl font-bold mb-6">Saved Programs</h1>

            {saved.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p className="text-lg mb-2">No saved programs</p>
                        <p className="text-sm">Click the 💾 icon on any program to save it for later.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {saved.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-all">
                            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{item.program.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{item.program.institution.name}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {item.program.category && <Badge variant="secondary">{item.program.category}</Badge>}
                                    {item.program.institution.city && (
                                        <Badge variant="outline">📍 {item.program.institution.city}</Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleApply(item.program.id)}>
                                        Apply
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleUnsave(item.program.id)}>
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
