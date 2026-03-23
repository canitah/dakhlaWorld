"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { exportToCSV } from "@/lib/export-csv";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { message } from "antd";
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
    Search,
    Filter,
    ChevronDown,
    X,
    Plus,
    Clock,
    DollarSign,
    BookOpen,
    Briefcase,
} from "lucide-react";

// --- Interfaces ---
interface Application {
    id: number;
    application_code: string;
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
    preferred_schedule: string | null;
    budget_min: number | null;
    budget_max: number | null;
    preferred_field: string | null;
    user: { email: string | null; phone: string | null };
}

type FilterColumn = "name" | "email" | "program" | "status" | "city" | "education";
type FilterOperator = "contains" | "equals" | "starts_with";
interface AdvancedFilter {
    id: number;
    column: FilterColumn;
    operator: FilterOperator;
    value: string;
}

const COLUMN_OPTIONS: { value: FilterColumn; label: string }[] = [
    { value: "name", label: "Applicant Name" },
    { value: "email", label: "Email" },
    { value: "program", label: "Program" },
    { value: "status", label: "Status" },
    { value: "city", label: "City" },
    { value: "education", label: "Education Level" },
];

const OPERATOR_OPTIONS: { value: FilterOperator; label: string }[] = [
    { value: "contains", label: "contains" },
    { value: "equals", label: "equals" },
    { value: "starts_with", label: "starts with" },
];

const STATUS_OPTIONS = ["submitted", "viewed", "accepted", "rejected", "withdrawn"];

// --- Helpers ---
function getFieldValue(app: Application, col: FilterColumn): string {
    switch (col) {
        case "name": return app.student.full_name || "";
        case "email": return app.student.user.email || "";
        case "program": return app.program.title;
        case "status": return app.status;
        case "city": return app.student.city || "";
        case "education": return app.student.education_level || "";
        default: return "";
    }
}

function matchesFilter(value: string, operator: FilterOperator, filterValue: string): boolean {
    const v = value.toLowerCase();
    const f = filterValue.toLowerCase();
    switch (operator) {
        case "contains": return v.includes(f);
        case "equals": return v === f;
        case "starts_with": return v.startsWith(f);
        default: return true;
    }
}

export default function InstitutionApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [programFilter, setProgramFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [advFilters, setAdvFilters] = useState<AdvancedFilter[]>([]);
    const [nextFilterId, setNextFilterId] = useState(1);

    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [programDropdownOpen, setProgramDropdownOpen] = useState(false);

    useEffect(() => { loadApplications(); }, []);

    async function loadApplications() {
        const res = await fetchWithAuth("/institutions/applications");
        if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
        }
        setIsLoading(false);
    }

    const handleStatusUpdate = async (appId: number, status: string) => {
        setUpdatingStatus(`${appId}_${status}`);
        try {
            const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                message.success(`Application marked as ${status}`);
                loadApplications();
            }
        } finally { setUpdatingStatus(null); }
    };

    const viewStudentProfile = async (studentId: number) => {
        const res = await fetchWithAuth(`/institutions/applicant/${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedStudent(data.student);
            setIsPreviewOpen(true);
        } else { message.error("Could not load student profile"); }
    };

    const uniquePrograms = useMemo(() => {
        const programs = new Map<number, string>();
        applications.forEach(app => programs.set(app.program.id, app.program.title));
        return Array.from(programs.entries()).map(([id, title]) => ({ id, title }));
    }, [applications]);

    const filteredApplications = useMemo(() => {
        let result = applications;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app =>
                (app.student.full_name || "").toLowerCase().includes(q) ||
                (app.student.user.email || "").toLowerCase().includes(q) ||
                app.program.title.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") { result = result.filter(app => app.status === statusFilter); }
        if (programFilter !== "all") { result = result.filter(app => app.program.id === parseInt(programFilter, 10)); }
        for (const f of advFilters) {
            if (!f.value.trim()) continue;
            result = result.filter(app => matchesFilter(getFieldValue(app, f.column), f.operator, f.value));
        }
        return result;
    }, [applications, searchQuery, statusFilter, programFilter, advFilters]);

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
            {/* Header */}
            <div className="flex flex-col gap-1 mb-6 px-1">
                <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
                <p className="text-sm text-muted-foreground">{applications.length} Total Applications</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search applicant or program..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border rounded-2xl focus:ring-2 focus:ring-blue-500/40 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <Button 
                                variant="outline" 
                                className="w-full justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm h-[42px]"
                                onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setProgramDropdownOpen(false); }}
                            >
                                <span className="capitalize">Status: {statusFilter}</span>
                                <ChevronDown className="size-4 opacity-50" />
                            </Button>
                            {statusDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-44 bg-card border rounded-2xl shadow-xl z-50 py-1">
                                    <button onClick={() => { setStatusFilter("all"); setStatusDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-accent capitalize">All</button>
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} onClick={() => { setStatusFilter(s); setStatusDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-accent capitalize">{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Program Dropdown (Restored) */}
                        <div className="relative flex-1 sm:flex-none">
                            <Button 
                                variant="outline" 
                                className="w-full justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm h-[42px]"
                                onClick={() => { setProgramDropdownOpen(!programDropdownOpen); setStatusDropdownOpen(false); }}
                            >
                                <span className="truncate max-w-[120px]">Program: {programFilter === "all" ? "All" : uniquePrograms.find(p => p.id === parseInt(programFilter))?.title}</span>
                                <ChevronDown className="size-4 opacity-50" />
                            </Button>
                            {programDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-card border rounded-2xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                                    <button onClick={() => { setProgramFilter("all"); setProgramDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">All Programs</button>
                                    {uniquePrograms.map(p => (
                                        <button key={p.id} onClick={() => { setProgramFilter(p.id.toString()); setProgramDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-accent truncate">{p.title}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button 
                            variant={showFilters ? "default" : "outline"} 
                            className={`rounded-2xl h-[42px] px-4 flex-1 sm:flex-none ${showFilters ? 'bg-blue-600' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="size-4 mr-2" /> Advanced
                        </Button>

                        <Button 
                            variant="outline" 
                            className="rounded-2xl h-[42px] px-4 flex-1 sm:flex-none"
                            onClick={() => exportToCSV(filteredApplications as any, "applications.csv")}
                        >
                            <FileDown className="size-4 mr-2" /> Export
                        </Button>
                    </div>
                </div>

                {/* Advanced Filter Panel (Restored Logic) */}
                {showFilters && (
                    <div className="bg-muted/30 border rounded-[2rem] p-5 space-y-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom Rules</h3>
                            <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => {
                                setAdvFilters([...advFilters, { id: nextFilterId, column: "name", operator: "contains", value: "" }]);
                                setNextFilterId(nextFilterId + 1);
                            }}>
                                <Plus className="size-4 mr-1" /> Add Rule
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {advFilters.map(f => (
                                <div key={f.id} className="flex flex-col sm:flex-row gap-2 bg-card p-3 rounded-2xl border">
                                    <select className="bg-transparent text-sm font-medium focus:outline-none min-w-[130px]" value={f.column} onChange={e => setAdvFilters(advFilters.map(x => x.id === f.id ? {...x, column: e.target.value as any} : x))}>
                                        {COLUMN_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <select className="bg-transparent text-sm text-blue-600 focus:outline-none min-w-[100px]" value={f.operator} onChange={e => setAdvFilters(advFilters.map(x => x.id === f.id ? {...x, operator: e.target.value as any} : x))}>
                                        {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <input className="flex-1 bg-muted/50 px-3 py-1 rounded-xl text-sm border-none" placeholder="Search..." value={f.value} onChange={e => setAdvFilters(advFilters.map(x => x.id === f.id ? {...x, value: e.target.value} : x))} />
                                    <Button size="sm" variant="ghost" onClick={() => setAdvFilters(advFilters.filter(x => x.id !== f.id))}><X className="size-4 text-red-500" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Applications List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredApplications.map(app => (
                    <Card key={app.id} className="rounded-[2rem] border-muted/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                                        {app.student.full_name?.charAt(0) || <User className="size-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg leading-none">{app.student.full_name || "—"}</h3>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{app.student.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" className="rounded-2xl h-10 px-5 text-sm font-semibold" onClick={() => viewStudentProfile(app.student.id)}>
                                        View Profile
                                    </Button>
                                    {app.status === 'submitted' && (
                                        <Button className="bg-blue-600 rounded-2xl h-10 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20" 
                                            onClick={() => handleStatusUpdate(app.id, 'viewed')} 
                                            disabled={updatingStatus === `${app.id}_viewed`}>
                                            Mark Viewed
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <Separator className="my-5 opacity-50" />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Target className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Program</p>
                                        <p className="text-sm font-bold truncate max-w-[150px]">{app.program.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Calendar className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Applied Date</p>
                                        <p className="text-sm font-bold">{new Date(app.created_at).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <MapPin className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">City</p>
                                        <p className="text-sm font-bold">{app.student.city || "Global"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredApplications.length === 0 && (
                    <div className="py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
                        <Search className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No matching applications found.</p>
                    </div>
                )}
            </div>

            {/* Profile Dialog (Full Details Restored) */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
                    {selectedStudent && (
                        <div className="max-h-[85vh] overflow-y-auto bg-card">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="size-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border-2 border-white/30 shadow-xl">
                                        {selectedStudent.full_name?.charAt(0)}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-2xl font-bold">{selectedStudent.full_name}</h2>
                                        <p className="text-blue-100 flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Mail className="size-3.5" /> {selectedStudent.user.email}
                                        </p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                            <Badge className="bg-white/20 hover:bg-white/30 border-none text-white rounded-lg">{selectedStudent.student_type}</Badge>
                                            <Badge className="bg-white/20 hover:bg-white/30 border-none text-white rounded-lg">{selectedStudent.education_level}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 sm:p-8 space-y-8">
                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Age Range", value: selectedStudent.age_range, icon: User },
                                        { label: "City", value: selectedStudent.city, icon: MapPin },
                                        { label: "Experience", value: selectedStudent.experience_level, icon: Briefcase },
                                        { label: "Schedule", value: selectedStudent.preferred_schedule, icon: Clock }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                                            <item.icon className="size-3.5 text-blue-600 mb-1" />
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{item.label}</p>
                                            <p className="text-xs font-bold truncate">{item.value || "—"}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-bold text-blue-600">
                                        <FileText className="size-4" /> Personal Statement
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 italic">
                                        "{selectedStudent.personal_statement || "No statement provided."}"
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><DollarSign className="size-3.5" /> Budget Range</p>
                                        <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl border italic">
                                            PKR {selectedStudent.budget_min?.toLocaleString()} - {selectedStudent.budget_max?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><BookOpen className="size-3.5" /> Learning Goals</p>
                                        <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl border truncate">
                                            {selectedStudent.learning_goal || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                               <Button 
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-[1.5rem] text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                                    onClick={async () => {
                                        try {
                                            const res = await fetchWithAuth(`/students/profile/cv?userId=${selectedStudent.user_id}`);
                                            if (!res.ok) throw new Error();
                                            const data = await res.json();
                                            
                                            const response = await fetch(data.url);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `${selectedStudent.full_name || 'Student'}_CV.pdf`);
                                            document.body.appendChild(link);
                                            link.click();
                                            
                                            link.parentNode?.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch { 
                                            message.error("pdf"); 
                                        }
                                    }}
                                >
                                    <FileDown className="size-5 mr-3" /> Download CV / Resume
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}