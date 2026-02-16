"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Program {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    institution: { name: string; city: string | null };
}

export default function ExplorePage() {
    const { fetchWithAuth } = useApi();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const categories = [
        "All",
        "Computer Science",
        "Engineering",
        "Business",
        "Medical",
        "Arts",
        "Law",
    ];

    useEffect(() => {
        loadPrograms();
    }, [page, category]);

    async function loadPrograms() {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: "12",
            ...(search && { search }),
            ...(category && category !== "All" && { category }),
        });
        const res = await fetchWithAuth(`/programs?${params}`);
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
            setTotalPages(data.pagination.totalPages);
        }
        setIsLoading(false);
    }

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

    const handleSave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) {
            const data = await res.json();
            toast.success(data.message);
        }
    };

    return (
        <DashboardLayout role="student">
            <h1 className="text-2xl font-bold mb-6">Explore Programs</h1>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                    <Input
                        placeholder="Search programs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadPrograms()}
                        className="h-11"
                    />
                    <Button onClick={loadPrograms} className="bg-blue-600 hover:bg-blue-700 h-11">
                        Search
                    </Button>
                </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={category === cat || (cat === "All" && !category) ? "default" : "outline"}
                        size="sm"
                        className={
                            category === cat || (cat === "All" && !category)
                                ? "bg-blue-600 hover:bg-blue-700"
                                : ""
                        }
                        onClick={() => {
                            setCategory(cat === "All" ? "" : cat);
                            setPage(1);
                        }}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Programs grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : programs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No programs found. Try different search terms.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {programs.map((program) => (
                            <Card key={program.id} className="hover:shadow-lg transition-all">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{program.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{program.institution.name}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {program.category && <Badge variant="secondary">{program.category}</Badge>}
                                        {program.institution.city && (
                                            <Badge variant="outline">📍 {program.institution.city}</Badge>
                                        )}
                                        {program.duration && (
                                            <Badge variant="outline">⏱️ {program.duration}</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleApply(program.id)}>
                                            Apply
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleSave(program.id)}>
                                            💾
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
}
