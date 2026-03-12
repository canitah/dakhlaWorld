"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { message } from "antd";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";

/* ─── Types ─── */

interface StudentApp {
    id: number;
    status: string;
    created_at: string;
    application_code: string;
    program: {
        title: string;
        institution: { name: string } | null;
    };
}

interface Student {
    id: number;
    full_name: string | null;
    city: string | null;
    student_type: string | null;
    education_level: string | null;
    intended_field: string | null;
    cv_url: string | null;
    created_at: string;
    user: {
        email: string | null;
        phone: string | null;
        created_at: string;
    };
    applications: StudentApp[];
}

/* ─── Page ─── */

export default function AdminStudentsPage() {
    const { fetchWithAuth } = useApi();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth("/admin/students");
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students || []);
            }
        } catch {
            message.error("Failed to load students");
        }
        setIsLoading(false);
    }

    const viewDetail = (student: Student) => {
        setSelectedStudent(student);
        setIsDetailOpen(true);
    };

    // Derived data
    const filtered = students.filter((s) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (s.full_name && s.full_name.toLowerCase().includes(q)) ||
            (s.user.email && s.user.email.toLowerCase().includes(q)) ||
            (s.city && s.city.toLowerCase().includes(q)) ||
            (s.user.phone && s.user.phone.includes(q))
        );
    });

    const totalApps = students.reduce((sum, s) => sum + s.applications.length, 0);
    const studentsWithApps = students.filter((s) => s.applications.length > 0).length;

    const exportStudents = () => {
        const data = filtered.map((s) => ({
            Name: s.full_name || "—",
            Email: s.user.email || "—",
            Phone: s.user.phone || "—",
            City: s.city || "—",
            "Student Type": s.student_type || "—",
            "Education Level": s.education_level || "—",
            "Intended Field": s.intended_field || "—",
            Applications: s.applications.length,
            "CV URL": s.cv_url || "—",
            Registered: new Date(s.user.created_at).toLocaleDateString(),
        }));
        exportToCSV(data, "students_export");
        message.success(`Exported ${data.length} students`);
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Students</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{students.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">With Applications</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{studentsWithApps}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Applications</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalApps}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">No Applications</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{students.length - studentsWithApps}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search + Export */}
            <div className="mb-4 flex items-center gap-3">
                <Input
                    placeholder="Search by name, email, city, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md h-10"
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2"
                    onClick={exportStudents}
                    disabled={filtered.length === 0}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Students ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            {search ? "No students match your search" : "No students registered yet"}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Name</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Email</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">City</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Field</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applications</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Registered</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((student) => (
                                        <tr key={student.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="py-3 text-sm font-medium">{student.full_name || "—"}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{student.user.email || "—"}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{student.city || "—"}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{student.intended_field || "—"}</td>
                                            <td className="py-3">
                                                <Badge variant={student.applications.length > 0 ? "default" : "secondary"} className="text-xs">
                                                    {student.applications.length}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(student.user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => viewDetail(student)}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>Detailed information about this student and their applications.</DialogDescription>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-5">
                            {/* Profile Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Full Name</p>
                                    <p className="text-sm font-medium">{selectedStudent.full_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm">{selectedStudent.user.email || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="text-sm">{selectedStudent.user.phone || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">City</p>
                                    <p className="text-sm">{selectedStudent.city || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Student Type</p>
                                    <p className="text-sm capitalize">{selectedStudent.student_type || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Education Level</p>
                                    <p className="text-sm capitalize">{selectedStudent.education_level || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Intended Field</p>
                                    <p className="text-sm">{selectedStudent.intended_field || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Registered</p>
                                    <p className="text-sm">{new Date(selectedStudent.user.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* CV */}
                            {selectedStudent.cv_url && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">CV / Resume</p>
                                    <a
                                        href={selectedStudent.cv_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
                                    >
                                        View CV →
                                    </a>
                                </div>
                            )}

                            {/* Applications List */}
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-3">
                                    Applications ({selectedStudent.applications.length})
                                </h4>
                                {selectedStudent.applications.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedStudent.applications.map((app) => (
                                            <div key={app.id} className="border border-border rounded-lg p-3 bg-accent/30">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-foreground truncate">{app.program.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {app.program.institution?.name || "DAKHLA Platform"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                            {app.application_code}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                        <StatusBadge status={app.status} />
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {new Date(app.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
