"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Application {
    id: number;
    status: string;
    created_at: string;
    student: {
        id: number;
        full_name: string | null;
        city: string | null;
        education_level: string | null;
        user: { email: string | null; phone: string | null };
    };
    program: { id: number; title: string; category: string | null };
}

interface StudentDetail {
    full_name: string | null;
    student_type: string | null;
    city: string | null;
    age_range: string | null;
    intended_field: string | null;
    personal_statement: string | null;
    education_level: string | null;
    experience_level: string | null;
    learning_goal: string | null;
    cv_url: string | null;
    user: { email: string | null; phone: string | null };
}

export default function InstitutionApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        const res = await fetchWithAuth("/institutions/applications");
        if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
        }
        setIsLoading(false);
    }

    const handleStatusUpdate = async (appId: number, status: string) => {
        const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Application ${status}`);
            loadApplications();
        }
    };

    const viewStudentProfile = async (studentId: number) => {
        const res = await fetchWithAuth(`/institutions/applicant/${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedStudent(data.student);
            setIsPreviewOpen(true);
        } else {
            toast.error("Could not load student profile");
        }
    };

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
            <h1 className="text-2xl font-bold mb-6">Applications ({applications.length})</h1>

            <Card>
                <CardContent className="pt-6">
                    {applications.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No applications received yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applicant</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="py-3">
                                                <div>
                                                    <p className="text-sm font-medium">{app.student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm">{app.program.title}</td>
                                            <td className="py-3"><StatusBadge status={app.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => viewStudentProfile(app.student.id)}>
                                                        Profile
                                                    </Button>
                                                    {app.status === "submitted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(app.id, "viewed")}>
                                                            Mark Viewed
                                                        </Button>
                                                    )}
                                                    {app.status !== "accepted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(app.id, "accepted")}>
                                                            Accept
                                                        </Button>
                                                    )}
                                                    {app.status !== "rejected" && (
                                                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleStatusUpdate(app.id, "rejected")}>
                                                            Reject
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Profile Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Profile</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{selectedStudent.full_name || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{selectedStudent.user.email || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">City</p><p className="text-sm">{selectedStudent.city || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm capitalize">{selectedStudent.student_type || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Education</p><p className="text-sm capitalize">{selectedStudent.education_level || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Experience</p><p className="text-sm capitalize">{selectedStudent.experience_level || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Intended Field</p><p className="text-sm">{selectedStudent.intended_field || "—"}</p></div>
                                <div><p className="text-xs text-muted-foreground">Age Range</p><p className="text-sm">{selectedStudent.age_range || "—"}</p></div>
                            </div>
                            {selectedStudent.learning_goal && (
                                <div><p className="text-xs text-muted-foreground">Learning Goal</p><p className="text-sm">{selectedStudent.learning_goal}</p></div>
                            )}
                            {selectedStudent.personal_statement && (
                                <div><p className="text-xs text-muted-foreground">Personal Statement</p><p className="text-sm">{selectedStudent.personal_statement}</p></div>
                            )}
                            {selectedStudent.cv_url && (
                                <a href={selectedStudent.cv_url} target="_blank" rel="noreferrer">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">📄 View CV</Button>
                                </a>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
