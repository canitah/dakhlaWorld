"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { message } from "antd";
import {
    UserOutlined,
    MailOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import {
    Users,
    GraduationCap,
    Trophy,
    Calendar,
    Target,
    Rocket,
    FileText,
    FileDown,
    MapPin,
    Mail,
    User,
    Briefcase,
    BookOpen,
} from "lucide-react";

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
    user_id: number;
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
    profile_picture_url: string | null;
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
            message.success(`Application ${status}`);
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
            message.error("Could not load student profile");
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

            {/* ─── Student Profile Preview Dialog (shadcn — auto dark/light) ─── */}
            <Dialog open={isPreviewOpen} onOpenChange={(open) => { if (!open) setIsPreviewOpen(false); }}>
                <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
                    {selectedStudent && (
                        <>
                            {/* ─── Header with profile picture & basic info ─── */}
                            <div className="relative">
                                {/* Avatar & name */}
                                <div className="px-6 pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            {selectedStudent.profile_picture_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={selectedStudent.profile_picture_url}
                                                    alt={selectedStudent.full_name || "Student"}
                                                    className="w-16 h-16 rounded-full border-2 border-border object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full border-2 border-border bg-blue-600 flex items-center justify-center">
                                                    <User className="size-7 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <DialogHeader className="text-left p-0">
                                                <DialogTitle className="text-xl font-bold truncate">
                                                    {selectedStudent.full_name || "Unnamed Student"}
                                                </DialogTitle>
                                                <DialogDescription className="sr-only">
                                                    Student profile details
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact info below avatar */}
                                <div className="px-6 mt-3 space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-3.5 shrink-0" />
                                        <span className="truncate">{selectedStudent.user.email || "—"}</span>
                                    </div>
                                    {selectedStudent.city && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="size-3.5 shrink-0" />
                                            <span>{selectedStudent.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── Quick Info Tags with Labels ─── */}
                            <div className="px-6 mt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {selectedStudent.student_type && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <Users className="size-4 text-blue-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Student Type
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.student_type}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.education_level && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                            <GraduationCap className="size-4 text-cyan-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Education
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.education_level}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.experience_level && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                            <Trophy className="size-4 text-purple-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Experience
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.experience_level}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.age_range && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <Calendar className="size-4 text-amber-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Age Range
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {selectedStudent.age_range}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="mx-6 mt-5" />

                            {/* ─── Detail Fields ─── */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Intended Field & Learning Goal */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedStudent.intended_field && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Target className="size-3.5" />
                                                Intended Field
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.intended_field}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStudent.learning_goal && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Rocket className="size-3.5" />
                                                Learning Goal
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.learning_goal}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Personal Statement */}
                                {selectedStudent.personal_statement && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <FileText className="size-3.5" />
                                            Personal Statement
                                        </div>
                                        <div className="p-3.5 rounded-lg bg-accent border border-border">
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {selectedStudent.personal_statement}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* CV Button */}
                                {selectedStudent.cv_url && (
                                    <>
                                        <Separator />
                                        <Button
                                            className="w-full h-11 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetchWithAuth(`/students/profile/cv?userId=${selectedStudent.user_id}`);
                                                    if (!res.ok) throw new Error();
                                                    const data = await res.json();
                                                    window.open(data.url, "_blank");
                                                } catch {
                                                    message.error("Failed to load CV");
                                                }
                                            }}
                                        >
                                            <FileDown className="size-5 mr-2" />
                                            View CV / Resume
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
