"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Program {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    is_active: boolean;
    _count: { applications: number };
}

const emptyProgram = {
    title: "",
    category: "",
    duration: "",
    eligibility: "",
    deadline: "",
    application_method: "internal",
    external_url: "",
    is_active: true,
};

export default function InstitutionProgramsPage() {
    const { fetchWithAuth } = useApi();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyProgram);
    const [instStatus, setInstStatus] = useState<string>("pending");

    useEffect(() => {
        loadPrograms();
        loadStatus();
    }, []);

    async function loadStatus() {
        const res = await fetchWithAuth("/institutions/profile");
        if (res.ok) {
            const data = await res.json();
            setInstStatus(data.profile.status);
        }
    }

    async function loadPrograms() {
        const res = await fetchWithAuth("/institutions/programs");
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
        }
        setIsLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId
            ? `/institutions/programs/${editingId}`
            : "/institutions/programs";
        const method = editingId ? "PUT" : "POST";

        const res = await fetchWithAuth(url, {
            method,
            body: JSON.stringify(form),
        });

        if (res.ok) {
            toast.success(editingId ? "Program updated" : "Program created");
            setIsDialogOpen(false);
            setEditingId(null);
            setForm(emptyProgram);
            loadPrograms();
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
    };

    const handleEdit = (program: Program) => {
        setEditingId(program.id);
        setForm({
            title: program.title,
            category: program.category || "",
            duration: program.duration || "",
            eligibility: program.eligibility || "",
            deadline: program.deadline ? program.deadline.split("T")[0] : "",
            application_method: program.application_method || "internal",
            external_url: program.external_url || "",
            is_active: program.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this program?")) return;
        const res = await fetchWithAuth(`/institutions/programs/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Program deleted");
            loadPrograms();
        }
    };

    const isApproved = instStatus === "approved";

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="institution">
            {/* Approval Warning */}
            {!isApproved && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <span className="text-xl mt-0.5">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-900">
                            Your Institution is Not Yet Approved
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                            You cannot post new programs until your institution has been approved by an admin. Please complete your profile and wait for approval.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Programs</h1>
                <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) { setEditingId(null); setForm(emptyProgram); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700" disabled={!isApproved}>
                            {isApproved ? "+ Post New Program" : "🔒 Posting Disabled"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Program" : "Create New Program"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Program Title *</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Computer Science" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 4 Years" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Eligibility</Label>
                                <Textarea value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Entry requirements..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Deadline</Label>
                                    <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Application Method</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.application_method} onChange={(e) => setForm({ ...form, application_method: e.target.value })}>
                                        <option value="internal">Internal (via GAP)</option>
                                        <option value="external">External URL</option>
                                    </select>
                                </div>
                            </div>
                            {form.application_method === "external" && (
                                <div className="space-y-2">
                                    <Label>External URL</Label>
                                    <Input type="url" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." />
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                {editingId ? "Update Program" : "Create Program"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {programs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p className="text-lg mb-2">No programs yet</p>
                        <p className="text-sm">Click &quot;Post New Program&quot; to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => (
                        <Card key={program.id} className="hover:shadow-lg transition-all">
                            <div className={`h-2 ${program.is_active ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-300"}`}></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{program.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {program.category && <Badge variant="secondary">{program.category}</Badge>}
                                    {program.duration && <Badge variant="outline">⏱️ {program.duration}</Badge>}
                                    <Badge variant="outline">{program._count.applications} applicants</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(program)}>
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(program.id)}>
                                        Delete
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
