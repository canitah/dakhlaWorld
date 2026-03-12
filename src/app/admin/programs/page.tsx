"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Modal, Form, Input as AntInput, Select as AntSelect, DatePicker as AntDatePicker, Button as AntButton, message } from "antd";
import { ExclamationCircleFilled, BookOutlined, TagOutlined, ClockCircleOutlined, CalendarOutlined, LinkOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    Clock,
    Calendar,
    Users,
    Tag,
    ExternalLink,
    GraduationCap,
    ClipboardCheck,
    X,
    DollarSign,
    Briefcase,
    MessageSquare,
    Power,
    FileText,
    Shield,
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

/* ── Main Page Component ──────────────────────────────────────── */

export default function AdminProgramsPage() {
    const { fetchWithAuth } = useApi();

    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyProgram);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [formQuestions, setFormQuestions] = useState<ProgramQuestion[]>([]);

    const selectProgram = useCallback((program: Program | null) => {
        setSelectedProgram(program);
        if (program) {
            window.history.replaceState(null, "", `/admin/programs/${program.program_code}`);
        } else {
            window.history.replaceState(null, "", `/admin/programs`);
        }
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, []);

    useEffect(() => {
        loadPrograms();
    }, []);

    async function loadPrograms() {
        const res = await fetchWithAuth("/admin/programs");
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);

            // Auto-select program from URL on initial load
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
        const url = editingId
            ? `/admin/programs/${editingId}`
            : "/admin/programs";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify({ ...form, questions: formQuestions }),
            });

            if (res.ok) {
                message.success(editingId ? "Program updated successfully!" : "Program created successfully!");
                setIsDialogOpen(false);
                setEditingId(null);
                setForm(emptyProgram);
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
        setForm({
            title: program.title,
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
            content: "Are you sure you want to delete this program? This action cannot be undone and will remove all associated data.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                const res = await fetchWithAuth(`/admin/programs/${id}`, { method: "DELETE" });
                if (res.ok) {
                    message.success("Program deleted successfully");
                    loadPrograms();
                    if (selectedProgram?.id === id) setSelectedProgram(null);
                } else {
                    message.error("Failed to delete program");
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
        } else {
            const data = await res.json();
            message.error(data.error || "Failed to update program status");
        }
    };

    /* Loading */
    if (isLoading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600" />
                        <p className="text-sm text-muted-foreground">Loading programs…</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">

            {/* ── Platform Badge ───────────────────────────────────── */}
            <div className="bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Shield className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                        Platform Programs
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-500 mt-0.5">
                        Programs posted here are marked as <strong>&quot;Posted by DAKHLA Platform&quot;</strong> and appear at the top of student search results. No plan limits apply.
                    </p>
                </div>
            </div>

            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Programs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {programs.length} program{programs.length !== 1 ? "s" : ""} posted by platform
                    </p>
                </div>

                {/* ── Post Program Dialog ──────────────────────────────── */}
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(v) => {
                        setIsDialogOpen(v);
                        if (!v) { setEditingId(null); setForm(emptyProgram); setFormQuestions([]); }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 h-10 px-4 shadow-sm text-sm font-medium">
                            <Plus className="size-4" />
                            Post New Program
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingId ? "Edit Program" : "Create New Program"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {editingId ? "Update the program details below" : "Fill in the details to publish a new platform program"}
                            </p>
                        </DialogHeader>

                        <Form
                            layout="vertical"
                            onFinish={handleSubmit}
                            requiredMark="optional"
                            disabled={isSubmitting}
                            className="mt-2"
                            fields={[
                                { name: "title", value: form.title },
                                { name: "category", value: form.category },
                                { name: "duration", value: form.duration },
                                { name: "eligibility", value: form.eligibility },
                                { name: "deadline", value: form.deadline ? dayjs(form.deadline) : null },
                                { name: "application_method", value: form.application_method },
                                ...(form.application_method === "external" ? [{ name: "external_url", value: form.external_url }] : []),
                            ]}
                        >
                            <Form.Item
                                name="title"
                                label={<span className="font-medium">Program Title</span>}
                                rules={[{ required: true, message: "Please enter a program title" }]}
                            >
                                <AntInput
                                    prefix={<BookOutlined className="text-gray-400" />}
                                    placeholder="e.g., BS Computer Science"
                                    size="large"
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="category"
                                    label={<span className="font-medium">Category</span>}
                                >
                                    <AntInput
                                        prefix={<TagOutlined className="text-gray-400" />}
                                        placeholder="e.g., Computer Science"
                                        size="large"
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="duration"
                                    label={<span className="font-medium">Duration</span>}
                                >
                                    <AntInput
                                        prefix={<ClockCircleOutlined className="text-gray-400" />}
                                        placeholder="e.g., 4 Years"
                                        size="large"
                                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="study_field"
                                    label={<span className="font-medium">Study Field</span>}
                                >
                                    <AntInput
                                        prefix={<BookOutlined className="text-gray-400" />}
                                        placeholder="e.g., Computer Science"
                                        size="large"
                                        onChange={(e) => setForm({ ...form, study_field: e.target.value })}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="schedule_type"
                                    label={<span className="font-medium">Schedule Type</span>}
                                >
                                    <AntSelect
                                        size="large"
                                        placeholder="Select schedule"
                                        onChange={(value) => setForm({ ...form, schedule_type: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={SCHEDULE_OPTIONS}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="fee"
                                label={<span className="font-medium">Total Fee / Budget (PKR)</span>}
                            >
                                <AntInput
                                    type="number"
                                    prefix={<span className="text-gray-400 text-sm">Rs</span>}
                                    placeholder="e.g., 500000"
                                    size="large"
                                    onChange={(e) => setForm({ ...form, fee: e.target.value ? parseInt(e.target.value) : null })}
                                />
                            </Form.Item>

                            <Form.Item
                                name="eligibility"
                                label={<span className="font-medium">Eligibility / Requirements</span>}
                            >
                                <AntInput.TextArea
                                    placeholder="Entry requirements, prerequisites, qualifications needed..."
                                    rows={3}
                                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                                    style={{ resize: "none" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-medium">Program Description</span>}
                            >
                                <AntInput.TextArea
                                    placeholder="Describe this program — what students will learn, career outcomes, etc."
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    style={{ resize: "none" }}
                                />
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
                                        onChange={(_date, dateString) => setForm({ ...form, deadline: dateString as string })}
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
            </div>

            {/* ── Empty State ────────────────────────────────────────── */}
            {programs.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-2xl py-20 text-center px-4 bg-card">
                    <BookOpen className="size-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-base font-semibold mb-1">No platform programs yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                        Post your first platform program to start reaching students directly.
                    </p>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 h-10 px-4 text-sm"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="size-4" />
                        Post New Program
                    </Button>
                </div>

            ) : selectedProgram ? (
                /* ── Selected Mode: List on left + Detail on right ──── */
                <>
                    {/* Mobile: show detail panel full-width with back button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => selectProgram(null)}
                            className="flex items-center gap-2 text-sm font-medium text-primary mb-4 cursor-pointer hover:underline"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back to programs
                        </button>
                        <ProgramDetailPanel
                            program={selectedProgram}
                            onClose={() => selectProgram(null)}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                            onToggleActive={handleToggleActive}
                        />
                    </div>
                    {/* Desktop: side-by-side layout */}
                    <div className="hidden md:flex gap-5 items-start">
                        <div className="w-[420px] shrink-0 space-y-4">
                            {programs.map((program) => (
                                <ProgramCard
                                    key={program.id}
                                    program={program}
                                    onClick={() => selectProgram(program)}
                                    isSelected={selectedProgram.id === program.id}
                                />
                            ))}
                        </div>
                        <ProgramDetailPanel
                            program={selectedProgram}
                            onClose={() => selectProgram(null)}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                            onToggleActive={handleToggleActive}
                        />
                    </div>
                </>
            ) : (
                /* ── Default Mode: Horizontal card grid ───────────────── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {programs.map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            onClick={() => selectProgram(program)}
                        />
                    ))}
                </div>
            )}

        </DashboardLayout>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PROGRAM CARD — full info, used in both grid and vertical list
   ═══════════════════════════════════════════════════════════════ */

function ProgramCard({
    program,
    onClick,
    isSelected,
}: {
    program: Program;
    onClick: () => void;
    isSelected?: boolean;
}) {
    return (
        <Card
            className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group ${isSelected ? "ring-2 ring-blue-500/50 border-blue-500/30" : ""
                }`}
            onClick={onClick}
        >
            <CardContent className="p-4 sm:p-5">
                {/* Title + Status row */}
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base font-bold text-foreground leading-snug truncate">
                        {program.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-500/15 text-[10px]">
                            <Shield className="size-3 mr-0.5" />
                            Platform
                        </Badge>
                        <Badge
                            variant={program.is_active ? "default" : "secondary"}
                            className={
                                program.is_active
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/15 text-[11px]"
                                    : "text-[11px]"
                            }
                        >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${program.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                            {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground mb-3">{program.program_code}</p>

                {/* Info fields — responsive grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Tag className="size-3.5 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Category</p>
                            <p className="text-sm font-medium text-foreground truncate">{program.category || "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-purple-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Duration</p>
                            <p className="text-sm font-medium text-foreground truncate">{program.duration || "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Deadline</p>
                            <p className="text-sm font-medium text-foreground truncate">
                                {program.deadline
                                    ? new Date(program.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClipboardCheck className="size-3.5 text-cyan-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Eligibility</p>
                            <p className="text-sm font-medium text-foreground truncate">{program.eligibility || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Fee, Schedule, Study Field row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    {program.fee != null && (
                        <div className="flex items-center gap-1.5">
                            <DollarSign className="size-3.5 text-green-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Fee</p>
                                <p className="text-sm font-medium text-foreground truncate">Rs {program.fee.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    {program.schedule_type && (
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Schedule</p>
                                <p className="text-sm font-medium text-foreground truncate">{program.schedule_type}</p>
                            </div>
                        </div>
                    )}
                    {program.study_field && (
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="size-3.5 text-teal-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Study Field</p>
                                <p className="text-sm font-medium text-foreground truncate">{program.study_field}</p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="mb-3" />

                {/* Footer badges + expand arrow */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-medium gap-1">
                            <Users className="size-3" />
                            {program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium gap-1">
                            {program.application_method === "external" ? (
                                <><ExternalLink className="size-3" /> External</>
                            ) : (
                                <><GraduationCap className="size-3" /> via GAP</>
                            )}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(program.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL PANEL (right side when a card is selected)
   ═══════════════════════════════════════════════════════════════ */

function ProgramDetailPanel({
    program,
    onClose,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    program: Program;
    onClose: () => void;
    onEdit: (p: Program) => void;
    onDelete: (id: number) => void;
    onToggleActive: (p: Program) => void;
}) {
    return (
        <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0">
                {/* ─── Detail Header ─── */}
                <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-500/15 text-[10px]">
                                <Shield className="size-3 mr-0.5" />
                                Posted by Platform
                            </Badge>
                            <Badge
                                variant={program.is_active ? "default" : "secondary"}
                                className={
                                    program.is_active
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/15"
                                        : ""
                                }
                            >
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${program.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                {program.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-medium gap-1">
                                {program.application_method === "external" ? (
                                    <><ExternalLink className="size-3" /> External</>
                                ) : (
                                    <><GraduationCap className="size-3" /> via GAP</>
                                )}
                            </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-foreground leading-snug">
                            {program.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <Separator />

                {/* ─── Detail Fields ─── */}
                <div className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {/* Category */}
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 shrink-0">
                                <Tag className="size-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Category</p>
                                <p className="text-sm font-medium text-foreground">{program.category || "—"}</p>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 shrink-0">
                                <Clock className="size-4 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Duration</p>
                                <p className="text-sm font-medium text-foreground">{program.duration || "—"}</p>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 shrink-0">
                                <Calendar className="size-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Deadline</p>
                                <p className="text-sm font-medium text-foreground">
                                    {program.deadline
                                        ? new Date(program.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                        : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Applicants */}
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-500/10 shrink-0">
                                <Users className="size-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Applicants</p>
                                <p className="text-sm font-medium text-foreground">
                                    {program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                        {/* Fee */}
                        {program.fee != null && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 shrink-0">
                                    <DollarSign className="size-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Total Fee</p>
                                    <p className="text-sm font-medium text-foreground">Rs {program.fee.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Schedule Type */}
                        {program.schedule_type && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 shrink-0">
                                    <Briefcase className="size-4 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Schedule</p>
                                    <p className="text-sm font-medium text-foreground">{program.schedule_type}</p>
                                </div>
                            </div>
                        )}

                        {/* Study Field */}
                        {program.study_field && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 shrink-0">
                                    <BookOpen className="size-4 text-teal-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Study Field</p>
                                    <p className="text-sm font-medium text-foreground">{program.study_field}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Eligibility (full width) */}
                    {program.eligibility && (
                        <div className="flex items-start gap-3 mt-5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 shrink-0">
                                <ClipboardCheck className="size-4 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Eligibility / Requirements</p>
                                <p className="text-sm font-medium text-foreground leading-relaxed">{program.eligibility}</p>
                            </div>
                        </div>
                    )}

                    {/* External URL */}
                    {program.application_method === "external" && program.external_url && (
                        <div className="flex items-start gap-3 mt-5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 shrink-0">
                                <ExternalLink className="size-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">External URL</p>
                                <a
                                    href={program.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline break-all"
                                >
                                    {program.external_url}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {program.description && (
                        <div className="flex items-start gap-3 mt-5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 shrink-0">
                                <FileText className="size-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Description</p>
                                <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-line">{program.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Questions */}
                    {program.questions && program.questions.length > 0 && (
                        <div className="flex items-start gap-3 mt-5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10 shrink-0">
                                <MessageSquare className="size-4 text-violet-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Application Questions</p>
                                <ul className="space-y-1">
                                    {program.questions.map((q, i) => (
                                        <li key={q.id || i} className="text-sm text-foreground">
                                            {i + 1}. {q.question}{q.is_required && <span className="text-red-400 ml-1">*</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* ─── Actions ─── */}
                <div className="px-6 py-4 flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => onEdit(program)}
                    >
                        <Pencil className="size-4" />
                        Edit Program
                    </Button>
                    <Button
                        variant="outline"
                        className={`flex items-center gap-2 text-sm ${program.is_active
                            ? "text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-500/10"
                            : "text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/10"
                            }`}
                        onClick={() => onToggleActive(program)}
                    >
                        <Power className="size-4" />
                        {program.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-sm text-red-500 border-red-200 dark:border-red-800 hover:bg-red-500/10 hover:text-red-600"
                        onClick={() => onDelete(program.id)}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
