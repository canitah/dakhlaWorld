"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Program {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    institution: { name: string; city: string | null };
}

interface ProgramDetail {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    is_active: boolean;
    created_at: string;
    institution: {
        id: number;
        name: string;
        city: string | null;
        category: string | null;
        description: string | null;
        contact_email: string | null;
    };
    _count: { applications: number };
}

export default function ExplorePage() {
    const { fetchWithAuth } = useApi();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

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

    const viewProgramDetail = async (programId: number) => {
        setIsDetailLoading(true);
        setIsDetailOpen(true);
        const res = await fetchWithAuth(`/programs/${programId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedProgram(data.program);
        } else {
            toast.error("Could not load program details");
            setIsDetailOpen(false);
        }
        setIsDetailLoading(false);
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
                            <Card key={program.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => viewProgramDetail(program.id)}>
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base group-hover:text-blue-600 transition-colors">{program.title}</CardTitle>
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
                                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); viewProgramDetail(program.id); }}>
                                            View Details
                                        </Button>
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs" onClick={(e) => { e.stopPropagation(); handleApply(program.id); }}>
                                            Apply
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSave(program.id); }}>
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

            {/* Program Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Program Details</DialogTitle>
                    </DialogHeader>
                    {isDetailLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : selectedProgram && (
                        <div className="space-y-5">
                            {/* Program Header */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedProgram.title}</h2>
                                <p className="text-sm text-muted-foreground mt-1">by {selectedProgram.institution.name}</p>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                {selectedProgram.category && <Badge variant="secondary">{selectedProgram.category}</Badge>}
                                {selectedProgram.duration && <Badge variant="outline">⏱️ {selectedProgram.duration}</Badge>}
                                {selectedProgram.institution.city && <Badge variant="outline">📍 {selectedProgram.institution.city}</Badge>}
                                <Badge variant="outline">👥 {selectedProgram._count.applications} applicants</Badge>
                            </div>

                            {/* Program Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Category</p>
                                    <p className="text-sm font-medium">{selectedProgram.category || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="text-sm font-medium">{selectedProgram.duration || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Deadline</p>
                                    <p className="text-sm font-medium">
                                        {selectedProgram.deadline
                                            ? new Date(selectedProgram.deadline).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "No deadline"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Application Method</p>
                                    <p className="text-sm font-medium capitalize">
                                        {selectedProgram.application_method === "external" ? "External" : "Via GAP"}
                                    </p>
                                </div>
                            </div>

                            {/* Eligibility */}
                            {selectedProgram.eligibility && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Eligibility Requirements</p>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{selectedProgram.eligibility}</p>
                                    </div>
                                </div>
                            )}

                            {/* Institution Info */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">About the Institution</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium">{selectedProgram.institution.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Type</p>
                                        <p className="text-sm capitalize">{selectedProgram.institution.category || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">City</p>
                                        <p className="text-sm">{selectedProgram.institution.city || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Contact</p>
                                        <p className="text-sm">{selectedProgram.institution.contact_email || "—"}</p>
                                    </div>
                                </div>
                                {selectedProgram.institution.description && (
                                    <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm text-gray-600">{selectedProgram.institution.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2 border-t">
                                {selectedProgram.application_method === "external" && selectedProgram.external_url ? (
                                    <a href={selectedProgram.external_url} target="_blank" rel="noreferrer" className="flex-1">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            Apply Externally ↗
                                        </Button>
                                    </a>
                                ) : (
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => {
                                            handleApply(selectedProgram.id);
                                            setIsDetailOpen(false);
                                        }}
                                    >
                                        Apply Now
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleSave(selectedProgram.id);
                                    }}
                                >
                                    💾 Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
