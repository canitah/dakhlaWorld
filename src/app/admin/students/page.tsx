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
import { Download, Search, User, MapPin, GraduationCap, Calendar, Eye, FileText } from "lucide-react";
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
    user_id: number;
    full_name: string | null;
    city: string | null;
    student_type: string | null;
    education_level: string | null;
    intended_field: string | null;
    cv_url: string | null;
    created_at: string;
    user: {
        id: number;
        email: string | null;
        phone: string | null;
        status: string;
        created_at: string;
    };
    applications: StudentApp[];
}

const EditableDetailItem = ({ label, value, isEditing, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    {isEditing ? (
      <input 
        className="text-sm font-medium border-b border-blue-400 outline-none bg-transparent w-full pb-0.5 focus:border-blue-600 transition-colors"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    )}
  </div>
);

export default function AdminStudentsPage() {
    const { fetchWithAuth } = useApi();
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);


   // 1. Pehle Function define karein (Error Fix karne ke liye)
async function loadStudents() {
    setIsLoading(true);
    try {
        const res = await fetchWithAuth("/admin/students");
        if (res.ok) {
            const data = await res.json();
            // Backend response ke mutabiq data set karein
            setStudents(data.students || []);
        }
    } catch (error) {
        // Aapka original error message
        message.error("Failed to load students");
        console.error("Load Error:", error);
    } finally {
        setIsLoading(false);
    }
}

// 2. Phir useEffect jo function ko call karega
useEffect(() => {
    loadStudents();
}, []);

// 3. View Detail function
const viewDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
};

    const openEditModal = (student: Student) => {
    console.log("Opening Modal for:", student.full_name); // Check karein console mein
    // Spread operator use karein taakay naya object reference banay
    setEditingStudent({ ...student }); 
    setIsEditOpen(true);
};

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

    

    const handleToggleBlock = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    try {
        const res = await fetch(`/api/admin/users/${userId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            message.success(`User ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`);
            loadStudents(); // List ko refresh karne ke liye
        }
    } catch (error) {
        message.error("Failed to update status");
    }
};
const handleUpdate = async (student: any) => {
    const profileId = student.id;

    if (!profileId) {
        console.error("Profile ID missing");
        return;
    }

    try {
        const res = await fetch(`/api/admin/manage-students/${profileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: student.full_name,
                city: student.city,
                phone: student.user?.phone,
                student_type: student.student_type,
                education_level: student.education_level,
                intended_field: student.intended_field,
            }),
        });

        if (res.ok) {
            // Success state on karein
            setUpdateSuccess(true);
            setIsEditing(false);
            loadStudents();

            // 3 seconds baad success message khud hi gayab ho jaye
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);

        } else {
            const data = await res.json();
            console.error(`Error: ${data.error}`);
        }
    } catch (e) {
        console.error("Update Error:", e);
    }
};
const toggleStudentStatus = async (student: any) => {
    if (!student) return;

    const currentStatus = student.user?.status; 
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    
    // ✅ UI instant update
    setStudents(prev => prev.map(s => 
        s.id === student.id 
        ? { ...s, user: { ...s.user, status: newStatus } } 
        : s
    ));

    try {
        const res = await fetch(`/api/admin/manage-students/${student.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: {   // ✅ FIXED
                    status: newStatus
                }
            }),
        });

        if (!res.ok) {
            message.error("Database update failed");
            loadStudents(); 
        } else {
            message.success(`Student ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
        }
    } catch (error) {
        console.error("Error:", error);
        loadStudents();
    }
};
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
            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold">Manage Students</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatCard title="Total Students" value={students.length} />
                    <StatCard title="With Apps" value={studentsWithApps} />
                    <StatCard title="Total Apps" value={totalApps} />
                    <StatCard title="No Apps" value={students.length - studentsWithApps} />
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 w-full"
                    />
                </div>
                <Button
                    variant="outline"
                    className="h-10 gap-2 w-full md:w-auto justify-center"
                    onClick={exportStudents}
                    disabled={filtered.length === 0}
                >
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            <Card className="border-none shadow-none md:border md:shadow-sm bg-transparent">
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg">Students ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">
                            {search ? "No students match your search" : "No students registered yet"}
                        </p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Name</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">City</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Field</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Apps</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Registered</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((student) => (
                                            <tr key={student.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                                                <td className="py-4">
                                                    <p className="text-sm font-medium">{student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{student.user.email}</p>
                                                </td>
                                                <td className="py-4 text-sm text-muted-foreground">{student.city || "—"}</td>
                                                <td className="py-4 text-sm text-muted-foreground">{student.intended_field || "—"}</td>
                                                <td className="py-4">
                                                    <Badge variant={student.applications.length > 0 ? "default" : "secondary"}>
                                                        {student.applications.length}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-sm text-muted-foreground">
                                                    {new Date(student.user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => viewDetail(student)}>View</Button>
                                                 

        {/* Naya Block/Unblock Button */}
      <Button 
        type="button"
        variant={student.user?.status === 'blocked' ? "default" : "destructive"} 
        size="sm" 
        className="font-bold min-w-[85px]"
        onClick={() => toggleStudentStatus(student)}
    >
        {student.user?.status === 'blocked' ? "Unblock" : "Block"}
    </Button>
        </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View - FIXED: Blue Header, Transparent Body */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {filtered.map((student) => (
                                    <div key={student.id} className="border border-border rounded-xl overflow-hidden bg-transparent shadow-sm">
                                        {/* Blue Header Section */}
                                        <div className="bg-blue-600 p-4 flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/20 p-2 rounded-full text-white">
                                                    <User className="size-4" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-white">{student.full_name || "—"}</h3>
                                                    <p className="text-[11px] text-blue-100">{student.user.email}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-white text-blue-600 hover:bg-white text-[10px] border-none">
                                                {student.applications.length} Apps
                                            </Badge>
                                        </div>

                                        {/* Transparent Body Section */}
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/50 py-3">
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> City</p>
                                                    <p className="font-medium">{student.city || "—"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground flex items-center gap-1"><GraduationCap className="size-3" /> Field</p>
                                                    <p className="font-medium truncate">{student.intended_field || "—"}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="size-3" /> {new Date(student.user.created_at).toLocaleDateString()}
                                                </p>
                                                <Button size="sm" variant="outline" className="h-8 text-xs px-4" onClick={() => viewDetail(student)}>
                                                    View Details
                                                </Button>
                                                {/* MOBILE BLOCK/UNBLOCK BUTTON */}
                        <Button 
                            type="button"
                            variant={student.user?.status === 'blocked' ? "default" : "destructive"} 
                            size="sm" 
                            className="h-9 text-xs font-bold"
                            onClick={() => toggleStudentStatus(student)}
                        >
                            {student.user?.status === 'blocked' ? "Unblock" : "Block"}
                        </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog - FIXED: Consistent with Theme */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-0 border-none bg-card text-card-foreground">
    {/* Dialog Header Blue */}
    <div className="bg-blue-600 p-6 text-white relative">
        <DialogTitle className="text-lg flex items-center gap-2 text-white">
            <FileText className="size-5" /> Student Profile
        </DialogTitle>
        <DialogDescription className="text-blue-100 mt-1">
            Overview of registration and academic interests.
        </DialogDescription>
        
        {/* Edit Toggle Button */}
        <Button 
            size="sm" 
            variant="secondary" 
            className="absolute top-6 right-12 h-8 text-xs font-bold"
            onClick={() => setIsEditing(!isEditing)}
        >
            {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
    </div>

    {selectedStudent && (
        <div className="p-6 space-y-6">
            {/* Success Notification Banner */}
        {updateSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold">Profile updated successfully!</p>
            </div>
        )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 bg-muted/20 p-4 rounded-xl border border-border">
                
                {/* Editable Fields using your layout */}
                <EditableDetailItem 
                    label="Full Name" 
                    value={selectedStudent.full_name} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, full_name: val})}
                />
                
                <DetailItem label="Email" value={selectedStudent.user.email} /> {/* Email usually fixed */}
                
                <EditableDetailItem 
                    label="Phone" 
                    value={selectedStudent.user.phone} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, user: {...selectedStudent.user, phone: val}})}
                />

                <EditableDetailItem 
                    label="City" 
                    value={selectedStudent.city} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, city: val})}
                />

                <EditableDetailItem 
                    label="Student Type" 
                    value={selectedStudent.student_type} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, student_type: val})}
                />

                <EditableDetailItem 
                    label="Education" 
                    value={selectedStudent.education_level} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, education_level: val})}
                />

                <EditableDetailItem 
                    label="Intended Field" 
                    value={selectedStudent.intended_field} 
                    isEditing={isEditing}
                    onChange={(val: any) => setSelectedStudent({...selectedStudent, intended_field: val})}
                />

                <DetailItem label="Registered" value={new Date(selectedStudent.user.created_at).toLocaleDateString()} />
            </div>

            {/* Save Changes Button - Only shows when editing */}
            {isEditing && (
                <Button 
    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg py-6 rounded-xl font-bold"
    onClick={() => {
        // Debugging: Browser console (F12) mein check karein
        console.log("Selected Student Object:", selectedStudent);
        
        // Agar 'id' missing hai lekin 'user_id' hai, to hum usay use kar sakte hain
        const targetId = selectedStudent.id || selectedStudent.user_id;
        
        if (!targetId) {
            alert("Error: No ID found for this student!");
            return;
        }
        
        handleUpdate({ ...selectedStudent, id: targetId });
    }}
>
    Update Profile
</Button>
            )}

            {/* Documents Section - Original */}
            {selectedStudent.cv_url && (
                <div className="border-t border-border pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Documents</p>
                    <a
                        href={selectedStudent.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all w-full justify-center"
                    >
                        <Eye className="size-4" /> View Full CV / Resume
                    </a>
                </div>
            )}

            {/* Applications Section - Original */}
            <div className="border-t border-border pt-4">
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Badge variant="outline">{selectedStudent.applications.length}</Badge>
                    Submitted Applications
                </h4>
                {selectedStudent.applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No applications submitted yet.</p>
                ) : (
                    <div className="space-y-3">
                        {selectedStudent.applications.map((app) => (
                            <div key={app.id} className="border border-border rounded-xl p-4 bg-muted/10 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{app.program.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {app.program.institution?.name || "DAKHLA Platform"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase bg-muted px-1 rounded inline-block">
                                            {app.application_code}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <StatusBadge status={app.status} />
                                        <p className="text-[10px] text-muted-foreground mt-2">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </p>
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

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
{/* Debug line */}
<p className="text-xs text-red-500">ID: {editingStudent?.id} - Name: {editingStudent?.full_name}</p>
        </DialogHeader>
        
        {editingStudent && (
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                        value={editingStudent.full_name || ""} 
                        onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">City</label>
                    <Input 
                        value={editingStudent.city || ""} 
                        onChange={(e) => setEditingStudent({...editingStudent, city: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Field of Interest</label>
                    <Input 
                        value={editingStudent.intended_field || ""} 
                        onChange={(e) => setEditingStudent({...editingStudent, intended_field: e.target.value})}
                    />
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleUpdate(editingStudent)}>Save Changes</Button>
                </div>
            </div>
        )}
    </DialogContent>
</Dialog>

        </DashboardLayout>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="border-none shadow-sm md:border bg-card">
            <CardContent className="pt-4 pb-3 md:pt-5 md:pb-4 px-3 md:px-6">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className="text-xl md:text-2xl font-black text-foreground mt-1">{value}</p>
            </CardContent>
        </Card>
    );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
            <p className="text-sm font-medium text-foreground truncate capitalize">{value || "—"}</p>
        </div>
    );
}