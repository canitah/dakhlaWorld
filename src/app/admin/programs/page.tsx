"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Modal, Form, Input as AntInput, Select as AntSelect, DatePicker as AntDatePicker, Button as AntButton, message } from "antd";
import { ExclamationCircleFilled, BookOutlined, TagOutlined, ClockCircleOutlined, BankOutlined, CalendarOutlined, LinkOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    Users,
    Tag,
    Shield,
    Search,
    DollarSign,
    Power,
    X,
    Lock,
    Clock,
    Calendar,
    AlertTriangle,
    ExternalLink,
    GraduationCap,
    ClipboardCheck,
    ChevronRight,
    MessageSquare,
    FileText,
} from "lucide-react";
import dayjs from "dayjs";

interface ProgramQuestion {
    id?: number;
    question: string;
    is_required: boolean;
}

interface Program {
    id: number;
    program_code: string;
    title: string;
    institute_name: string | null;
    description: string | null;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    is_active: boolean;
    created_at: string;
    _count: { applications: number };
    fee: number | null;
    schedule_type: string | null;
    study_field: string | null;
    questions?: ProgramQuestion[];
}

const SCHEDULE_OPTIONS = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
];

const emptyProgram = {
    title: "",
    institute_name: "",
    description: "",
    category: "",
    duration: "",
    eligibility: "",
    deadline: "",
    application_method: "internal",
    external_url: "",
    is_active: true,
    fee: null as number | null,
    schedule_type: "",
    study_field: "",
};

export default function AdminProgramsPage() {
    const { fetchWithAuth } = useApi();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState(emptyProgram);
    const [form, setForm] = useState(emptyProgram);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [formQuestions, setFormQuestions] = useState<ProgramQuestion[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPrograms = useMemo(() => {
        return programs.filter((p) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                p.title.toLowerCase().includes(searchLower) ||
                (p.institute_name?.toLowerCase() || "").includes(searchLower) ||
                (p.category?.toLowerCase() || "").includes(searchLower) ||
                (p.study_field?.toLowerCase() || "").includes(searchLower) ||
                (p.fee?.toString() || "").includes(searchLower) ||
                p.program_code.toLowerCase().includes(searchLower)
            );
        });
    }, [programs, searchQuery]);

    const selectProgram = useCallback((program: Program | null) => {
        setSelectedProgram(program);
        if (program) {
            window.history.replaceState(null, "", `/admin/programs/${program.program_code}`);
        } else {
            window.history.replaceState(null, "", `/admin/programs`);
        }
    }, []);

    useEffect(() => {
        loadPrograms();
    }, []);

    async function loadPrograms() {
        const res = await fetchWithAuth("/admin/programs");
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
            const match = window.location.pathname.match(/\/admin\/programs\/(PRG-\d+)/);
            const code = match ? match[1] : null;
            if (code) {
                const found = (data.programs as Program[]).find((p: Program) => p.program_code === code);
                if (found) setSelectedProgram(found);
            }
        }
        setIsLoading(false);
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const url = editingId ? `/admin/programs/${editingId}` : "/admin/programs";
        const method = editingId ? "PUT" : "POST";
        try {
            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify({ ...formState, questions: formQuestions }),
            });
            if (res.ok) {
                message.success(editingId ? "Program updated successfully!" : "Program created successfully!");
                setIsDialogOpen(false);
                setEditingId(null);
                setFormState(emptyProgram);
                setFormQuestions([]);
                loadPrograms();
            } else {
                const data = await res.json();
                message.error(data.error);
            }
        } catch {
            message.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (program: Program) => {
        setEditingId(program.id);
        setFormState({
            title: program.title,
            institute_name: program.institute_name || "",
            description: program.description || "",
            category: program.category || "",
            duration: program.duration || "",
            eligibility: program.eligibility || "",
            deadline: program.deadline ? program.deadline.split("T")[0] : "",
            application_method: program.application_method || "internal",
            external_url: program.external_url || "",
            is_active: program.is_active,
            fee: program.fee,
            schedule_type: program.schedule_type || "",
            study_field: program.study_field || "",
        });
        setFormQuestions(program.questions || []);
        setIsDialogOpen(true);
    };

    const handleDeleteRequest = (id: number) => {
        Modal.confirm({
            title: "Delete Program",
            icon: <ExclamationCircleFilled />,
            content: "Are you sure you want to delete this program?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                const res = await fetchWithAuth(`/admin/programs/${id}`, { method: "DELETE" });
                if (res.ok) {
                    message.success("Program deleted successfully");
                    loadPrograms();
                    if (selectedProgram?.id === id) setSelectedProgram(null);
                }
            },
        });
    };

    const handleToggleActive = async (program: Program) => {
        const newActive = !program.is_active;
        const res = await fetchWithAuth(`/admin/programs/${program.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...program, is_active: newActive, deadline: program.deadline ? program.deadline.split("T")[0] : "" }),
        });
        if (res.ok) {
            message.success(newActive ? "Program activated" : "Program deactivated");
            loadPrograms();
            if (selectedProgram?.id === program.id) {
                setSelectedProgram({ ...program, is_active: newActive });
            }
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Shield className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-900">Platform Programs</p>
                    <p className="text-sm text-blue-700 mt-0.5">Programs posted here are marked as "Posted by DAKHLA Platform".</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Programs</h1>
                    <p className="text-sm text-muted-foreground mt-1">{programs.length} programs posted</p>
                </div>

                {/* Mobile View: Search below Button | Desktop View: Side by Side */}
                <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-3">
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(v) => {
                            setIsDialogOpen(v);
                            if (!v) { setEditingId(null); setFormState(emptyProgram); setFormQuestions([]); }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-4 w-full sm:w-auto">
                                <Plus className="size-4 mr-2" /> Post New Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    {editingId ? "Edit Program" : "Create New Program"}
                                </DialogTitle>
                            </DialogHeader>
                            <Form
                                                        layout="vertical"
                                                        onFinish={handleSubmit}
                                                        requiredMark="optional"
                                                        disabled={isSubmitting}
                                                        className="mt-2"
                                                        fields={[
                                                            { name: "title", value: formState.title },
                                                            { name: "category", value: formState.category },
                                                            { name: "duration", value: formState.duration },
                                                            { name: "eligibility", value: formState.eligibility },
                                                            { name: "deadline", value: formState.deadline ? dayjs(formState.deadline) : null },
                                                            { name: "application_method", value: formState.application_method },
                                                            ...(formState.application_method === "external" ? [{ name: "external_url", value: formState.external_url }] : []),
                                                        ]}
                                                    >
                                <Form.Item label={<span className="font-medium">Program Title</span>} rules={[{ required: true }]}>
                                    <AntInput prefix={<BookOutlined />} placeholder="e.g., BS Computer Science" size="large" value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} />
                                </Form.Item>
                                <Form.Item label={<span className="font-medium">University / Institute Name</span>}>
                                    <AntInput prefix={<BankOutlined />} placeholder="e.g., Punjab University" size="large" value={formState.institute_name} onChange={(e) => setFormState({ ...formState, institute_name: e.target.value })} />
                                </Form.Item>
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item label="Category">
                                        <AntInput prefix={<TagOutlined />} placeholder="e.g., CS" size="large" value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} />
                                    </Form.Item>
                                    <Form.Item label="Duration">
                                        <AntInput prefix={<ClockCircleOutlined />} placeholder="4 Years" size="large" value={formState.duration} onChange={(e) => setFormState({ ...formState, duration: e.target.value })} />
                                    </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item label="Study Field">
                                        <AntInput prefix={<BookOutlined />} size="large" value={formState.study_field} onChange={(e) => setFormState({ ...formState, study_field: e.target.value })} />
                                    </Form.Item>
                                    <Form.Item label="Schedule">
                                        <AntSelect size="large" options={SCHEDULE_OPTIONS} value={formState.schedule_type} onChange={(v) => setFormState({ ...formState, schedule_type: v })} />
                                    </Form.Item>
                                </div>
                                <Form.Item label="Total Fee (PKR)">
                                    <AntInput type="number" prefix="Rs" size="large" value={formState.fee || ""} onChange={(e) => setFormState({ ...formState, fee: e.target.value ? parseInt(e.target.value) : null })} />
                                </Form.Item>
                                <Form.Item label="Description">
                                    <AntInput.TextArea rows={4} value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} style={{ resize: "none" }} />
                                </Form.Item>
                                <div className="grid grid-cols-2 gap-4"> 
                                <Form.Item
                                    name="deadline"
                                    label={<span className="font-medium">Deadline</span>}
                                >
                                    <AntDatePicker
                                        suffixIcon={<CalendarOutlined />}
                                        placeholder="Select deadline"
                                        size="large"
                                        className="w-full"
                                        format="YYYY-MM-DD"
                                        onChange={(_date, dateString) => setFormState({ ...formState, deadline: dateString as string })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="application_method"
                                    label={<span className="font-medium">Application Method</span>}
                                >
                                    <AntSelect
                                        size="large"
                                        onChange={(value) => setForm({ ...form, application_method: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={[
                                            { value: "internal", label: "Internal (via GAP)" },
                                            { value: "external", label: "External URL" },
                                        ]}
                                    />
                                </Form.Item>
                            </div>

                            {form.application_method === "external" && (
                                <Form.Item
                                    name="external_url"
                                    label={<span className="font-medium">External URL</span>}
                                >
                                    <AntInput
                                        prefix={<LinkOutlined className="text-gray-400" />}
                                        placeholder="https://apply.example.com"
                                        size="large"
                                        onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                                    />
                                </Form.Item>
                            )}

                            {/* ── Custom Questions Section ── */}
                            <div className="border border-border rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm flex items-center gap-2">
                                        <MessageSquare className="size-4 text-blue-500" />
                                        Application Questions
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFormQuestions([...formQuestions, { question: "", is_required: true }])}
                                        className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                                    >
                                        + Add Question
                                    </button>
                                </div>
                                {formQuestions.length === 0 && (
                                    <p className="text-xs text-muted-foreground">No custom questions. Students will only submit their CV when applying.</p>
                                )}
                                {formQuestions.map((q, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <AntInput
                                            placeholder={`Question ${i + 1}`}
                                            value={q.question}
                                            onChange={(e) => {
                                                const updated = [...formQuestions];
                                                updated[i] = { ...updated[i], question: e.target.value };
                                                setFormQuestions(updated);
                                            }}
                                            className="flex-1"
                                        />
                                        <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap mt-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={q.is_required}
                                                onChange={(e) => {
                                                    const updated = [...formQuestions];
                                                    updated[i] = { ...updated[i], is_required: e.target.checked };
                                                    setFormQuestions(updated);
                                                }}
                                            />
                                            Required
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormQuestions(formQuestions.filter((_, j) => j !== i))}
                                            className="p-1 text-red-400 hover:text-red-600 cursor-pointer mt-0.5"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Form.Item className="mb-0 pt-2">
                                <AntButton
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    icon={isSubmitting ? undefined : (editingId ? <EditOutlined /> : <PlusOutlined />)}
                                    size="large"
                                    block
                                    className="h-12 font-semibold text-[15px]"
                                    style={{ background: "#2563eb", borderColor: "transparent" }}
                                >
                                    {isSubmitting
                                        ? (editingId ? "Updating..." : "Creating...")
                                        : (editingId ? "Update Program" : "Create Program")
                                    }
                                </AntButton>
                            </Form.Item>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Search Bar - Fixed under button in mobile via sm:flex-row-reverse */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, fee, field..."
                            className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-2xl py-20 text-center bg-card">
                    <BookOpen className="size-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-base font-semibold">No programs found</h3>
                </div>
            ) : selectedProgram ? (
                <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="hidden md:block w-[420px] shrink-0 space-y-4">
                        {filteredPrograms.map((p) => (
                            <ProgramCard key={p.id} program={p} onClick={() => selectProgram(p)} isSelected={selectedProgram.id === p.id} />
                        ))}
                    </div>
                    <ProgramDetailPanel program={selectedProgram} onClose={() => selectProgram(null)} onEdit={handleEdit} onDelete={handleDeleteRequest} onToggleActive={handleToggleActive} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPrograms.map((p) => (
                        <ProgramCard key={p.id} program={p} onClick={() => selectProgram(p)} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

function ProgramCard({ program, onClick, isSelected }: { program: Program; onClick: () => void; isSelected?: boolean }) {
    return (
        <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${isSelected ? "ring-2 ring-blue-500/50 border-blue-500" : ""}`} onClick={onClick}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base font-bold truncate">{program.title}</h3>
                    <Badge className="bg-blue-500/15 text-blue-700 text-[10px]"><Shield className="size-3 mr-0.5" /> Platform</Badge>
                </div>
                <p className="text-xs text-blue-600 font-medium mb-2">{program.institute_name || "Dakhla University"}</p>
                <p className="text-[11px] font-mono text-muted-foreground mb-3">{program.program_code}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-1.5"><Tag className="size-3.5 text-blue-500" /><span className="text-sm truncate">{program.category || "—"}</span></div>
                    <div className="flex items-center gap-1.5"><DollarSign className="size-3.5 text-green-500" /><span className="text-sm">Rs {program.fee?.toLocaleString() || "—"}</span></div>
                </div>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs"><Users className="size-3 mr-1" />{program._count.applications} Applicants</Badge>
                    <div className="text-xs text-muted-foreground">{new Date(program.created_at).toLocaleDateString()}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProgramDetailPanel({ program, onClose, onEdit, onDelete, onToggleActive }: any) {
    return (
        <Card className="w-full flex-1 overflow-hidden">
            <CardContent className="p-0">
                <div className="px-6 pt-5 pb-4 flex items-start justify-between">
                    <div>
                        <Badge className="bg-blue-500/15 text-blue-700 mb-2"><Shield className="size-3 mr-1" /> Posted by Platform</Badge>
                        <h2 className="text-xl font-bold">{program.title}</h2>
                        <p className="text-sm text-blue-600 font-semibold mt-1">{program.institute_name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X className="size-5" /></button>
                </div>
                <Separator />
                <div className="px-6 py-5 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div><p className="text-[11px] font-semibold text-muted-foreground uppercase">Category</p><p className="text-sm font-medium">{program.category || "—"}</p></div>
                        <div><p className="text-[11px] font-semibold text-muted-foreground uppercase">Fee</p><p className="text-sm font-medium">Rs {program.fee?.toLocaleString() || "—"}</p></div>
                    </div>
                    <div><p className="text-[11px] font-semibold text-muted-foreground uppercase">Description</p><p className="text-sm leading-relaxed whitespace-pre-line">{program.description}</p></div>
                </div>
                <Separator />
                <div className="px-6 py-4 flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => onEdit(program)} className="flex-1 sm:flex-none"><Pencil className="size-4 mr-2" /> Edit</Button>
                    <Button variant="outline" className={program.is_active ? "text-amber-600" : "text-emerald-600"} onClick={() => onToggleActive(program)}>
                        <Power className="size-4 mr-2" /> {program.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" className="text-red-500" onClick={() => onDelete(program.id)}><Trash2 className="size-4 mr-2" /> Delete</Button>
                </div>
            </CardContent>
        </Card>
    );
}