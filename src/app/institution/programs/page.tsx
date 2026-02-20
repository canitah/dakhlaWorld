// // "use client";

// // import { useEffect, useState } from "react";
// // import { useApi } from "@/hooks/use-api";
// // import { DashboardLayout } from "@/components/dashboard-layout";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Badge } from "@/components/ui/badge";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// // import { toast } from "sonner";

// // interface Program {
// //     id: number;
// //     title: string;
// //     category: string | null;
// //     duration: string | null;
// //     eligibility: string | null;
// //     deadline: string | null;
// //     application_method: string | null;
// //     external_url: string | null;
// //     is_active: boolean;
// //     _count: { applications: number };
// // }

// // const emptyProgram = {
// //     title: "",
// //     category: "",
// //     duration: "",
// //     eligibility: "",
// //     deadline: "",
// //     application_method: "internal",
// //     external_url: "",
// //     is_active: true,
// // };

// // export default function InstitutionProgramsPage() {
// //     const { fetchWithAuth } = useApi();
// //     const [programs, setPrograms] = useState<Program[]>([]);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [isDialogOpen, setIsDialogOpen] = useState(false);
// //     const [editingId, setEditingId] = useState<number | null>(null);
// //     const [form, setForm] = useState(emptyProgram);
// //     const [instStatus, setInstStatus] = useState<string>("pending");

// //     useEffect(() => {
// //         loadPrograms();
// //         loadStatus();
// //     }, []);

// //     async function loadStatus() {
// //         const res = await fetchWithAuth("/institutions/profile");
// //         if (res.ok) {
// //             const data = await res.json();
// //             setInstStatus(data.profile.status);
// //         }
// //     }

// //     async function loadPrograms() {
// //         const res = await fetchWithAuth("/institutions/programs");
// //         if (res.ok) {
// //             const data = await res.json();
// //             setPrograms(data.programs);
// //         }
// //         setIsLoading(false);
// //     }

// //     const handleSubmit = async (e: React.FormEvent) => {
// //         e.preventDefault();
// //         const url = editingId
// //             ? `/institutions/programs/${editingId}`
// //             : "/institutions/programs";
// //         const method = editingId ? "PUT" : "POST";

// //         const res = await fetchWithAuth(url, {
// //             method,
// //             body: JSON.stringify(form),
// //         });

// //         if (res.ok) {
// //             toast.success(editingId ? "Program updated" : "Program created");
// //             setIsDialogOpen(false);
// //             setEditingId(null);
// //             setForm(emptyProgram);
// //             loadPrograms();
// //         } else {
// //             const data = await res.json();
// //             toast.error(data.error);
// //         }
// //     };

// //     const handleEdit = (program: Program) => {
// //         setEditingId(program.id);
// //         setForm({
// //             title: program.title,
// //             category: program.category || "",
// //             duration: program.duration || "",
// //             eligibility: program.eligibility || "",
// //             deadline: program.deadline ? program.deadline.split("T")[0] : "",
// //             application_method: program.application_method || "internal",
// //             external_url: program.external_url || "",
// //             is_active: program.is_active,
// //         });
// //         setIsDialogOpen(true);
// //     };

// //     const handleDelete = async (id: number) => {
// //         if (!confirm("Delete this program?")) return;
// //         const res = await fetchWithAuth(`/institutions/programs/${id}`, { method: "DELETE" });
// //         if (res.ok) {
// //             toast.success("Program deleted");
// //             loadPrograms();
// //         }
// //     };

// //     const isApproved = instStatus === "approved";

// //     if (isLoading) {
// //         return (
// //             <DashboardLayout role="institution">
// //                 <div className="flex items-center justify-center h-64">
// //                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
// //                 </div>
// //             </DashboardLayout>
// //         );
// //     }

// //     return (
// //         <DashboardLayout role="institution">
// //             {/* Approval Warning */}
// //             {!isApproved && (
// //                 <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6 flex items-start gap-3">
// //                     <span className="text-xl mt-0.5">⚠️</span>
// //                     <div>
// //                         <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">
// //                             Your Institution is Not Yet Approved
// //                         </p>
// //                         <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
// //                             You cannot post new programs until your institution has been approved by an admin. Please complete your profile and wait for approval.
// //                         </p>
// //                     </div>
// //                 </div>
// //             )}

// //             <div className="flex items-center justify-between mb-6">
// //                 <h1 className="text-2xl font-bold">My Programs</h1>
// //                 <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) { setEditingId(null); setForm(emptyProgram); } }}>
// //                     <DialogTrigger asChild>
// //                         <Button className="bg-blue-600 hover:bg-blue-700" disabled={!isApproved}>
// //                             {isApproved ? "+ Post New Program" : "🔒 Posting Disabled"}
// //                         </Button>
// //                     </DialogTrigger>
// //                     <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
// //                         <DialogHeader>
// //                             <DialogTitle>{editingId ? "Edit Program" : "Create New Program"}</DialogTitle>
// //                         </DialogHeader>
// //                         <form onSubmit={handleSubmit} className="space-y-4">
// //                             <div className="space-y-2">
// //                                 <Label>Program Title *</Label>
// //                                 <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
// //                             </div>
// //                             <div className="grid grid-cols-2 gap-4">
// //                                 <div className="space-y-2">
// //                                     <Label>Category</Label>
// //                                     <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Computer Science" />
// //                                 </div>
// //                                 <div className="space-y-2">
// //                                     <Label>Duration</Label>
// //                                     <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 4 Years" />
// //                                 </div>
// //                             </div>
// //                             <div className="space-y-2">
// //                                 <Label>Eligibility</Label>
// //                                 <Textarea value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Entry requirements..." />
// //                             </div>
// //                             <div className="grid grid-cols-2 gap-4">
// //                                 <div className="space-y-2">
// //                                     <Label>Deadline</Label>
// //                                     <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
// //                                 </div>
// //                                 <div className="space-y-2">
// //                                     <Label>Application Method</Label>
// //                                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.application_method} onChange={(e) => setForm({ ...form, application_method: e.target.value })}>
// //                                         <option value="internal">Internal (via GAP)</option>
// //                                         <option value="external">External URL</option>
// //                                     </select>
// //                                 </div>
// //                             </div>
// //                             {form.application_method === "external" && (
// //                                 <div className="space-y-2">
// //                                     <Label>External URL</Label>
// //                                     <Input type="url" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." />
// //                                 </div>
// //                             )}
// //                             <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
// //                                 {editingId ? "Update Program" : "Create Program"}
// //                             </Button>
// //                         </form>
// //                     </DialogContent>
// //                 </Dialog>
// //             </div>

// //             {programs.length === 0 ? (
// //                 <Card>
// //                     <CardContent className="py-12 text-center text-muted-foreground">
// //                         <p className="text-lg mb-2">No programs yet</p>
// //                         <p className="text-sm">Click &quot;Post New Program&quot; to get started.</p>
// //                     </CardContent>
// //                 </Card>
// //             ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                     {programs.map((program) => (
// //                         <Card key={program.id} className="hover:shadow-lg transition-all">
// //                             <div className={`h-2 ${program.is_active ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-muted"}`}></div>
// //                             <CardHeader className="pb-2">
// //                                 <CardTitle className="text-base">{program.title}</CardTitle>
// //                             </CardHeader>
// //                             <CardContent>
// //                                 <div className="flex flex-wrap gap-1.5 mb-3">
// //                                     {program.category && <Badge variant="secondary">{program.category}</Badge>}
// //                                     {program.duration && <Badge variant="outline">⏱️ {program.duration}</Badge>}
// //                                     <Badge variant="outline">{program._count.applications} applicants</Badge>
// //                                 </div>
// //                                 <div className="flex gap-2">
// //                                     <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(program)}>
// //                                         Edit
// //                                     </Button>
// //                                     <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(program.id)}>
// //                                         Delete
// //                                     </Button>
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     ))}
// //                 </div>
// //             )}
// //         </DashboardLayout>
// //     );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { useApi } from "@/hooks/use-api";
// import { DashboardLayout } from "@/components/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { toast } from "sonner";

// interface Program {
//     id: number;
//     title: string;
//     category: string | null;
//     duration: string | null;
//     eligibility: string | null;
//     deadline: string | null;
//     application_method: string | null;
//     external_url: string | null;
//     is_active: boolean;
//     _count: { applications: number };
// }

// const emptyProgram = {
//     title: "",
//     category: "",
//     duration: "",
//     eligibility: "",
//     deadline: "",
//     application_method: "internal",
//     external_url: "",
//     is_active: true,
// };

// // SVG Icons
// const PlusIcon = () => (
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//     </svg>
// );

// const LockIcon = () => (
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//     </svg>
// );

// const PencilIcon = () => (
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//     </svg>
// );

// const TrashIcon = () => (
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//     </svg>
// );

// const BookOpenIcon = () => (
//     <svg className="w-10 h-10 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//     </svg>
// );

// const WarningIcon = () => (
//     <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//     </svg>
// );

// const ClockIcon = () => (
//     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//     </svg>
// );

// const UsersIcon = () => (
//     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
//     </svg>
// );

// const CalendarIcon = () => (
//     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//     </svg>
// );

// export default function InstitutionProgramsPage() {
//     const { fetchWithAuth } = useApi();
//     const [programs, setPrograms] = useState<Program[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingId, setEditingId] = useState<number | null>(null);
//     const [form, setForm] = useState(emptyProgram);
//     const [instStatus, setInstStatus] = useState<string>("pending");

//     useEffect(() => {
//         loadPrograms();
//         loadStatus();
//     }, []);

//     async function loadStatus() {
//         const res = await fetchWithAuth("/institutions/profile");
//         if (res.ok) {
//             const data = await res.json();
//             setInstStatus(data.profile.status);
//         }
//     }

//     async function loadPrograms() {
//         const res = await fetchWithAuth("/institutions/programs");
//         if (res.ok) {
//             const data = await res.json();
//             setPrograms(data.programs);
//         }
//         setIsLoading(false);
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const url = editingId
//             ? `/institutions/programs/${editingId}`
//             : "/institutions/programs";
//         const method = editingId ? "PUT" : "POST";

//         const res = await fetchWithAuth(url, {
//             method,
//             body: JSON.stringify(form),
//         });

//         if (res.ok) {
//             toast.success(editingId ? "Program updated" : "Program created");
//             setIsDialogOpen(false);
//             setEditingId(null);
//             setForm(emptyProgram);
//             loadPrograms();
//         } else {
//             const data = await res.json();
//             toast.error(data.error);
//         }
//     };

//     const handleEdit = (program: Program) => {
//         setEditingId(program.id);
//         setForm({
//             title: program.title,
//             category: program.category || "",
//             duration: program.duration || "",
//             eligibility: program.eligibility || "",
//             deadline: program.deadline ? program.deadline.split("T")[0] : "",
//             application_method: program.application_method || "internal",
//             external_url: program.external_url || "",
//             is_active: program.is_active,
//         });
//         setIsDialogOpen(true);
//     };

//     const handleDelete = async (id: number) => {
//         if (!confirm("Delete this program?")) return;
//         const res = await fetchWithAuth(`/institutions/programs/${id}`, { method: "DELETE" });
//         if (res.ok) {
//             toast.success("Program deleted");
//             loadPrograms();
//         }
//     };

//     const isApproved = instStatus === "approved";

//     if (isLoading) {
//         return (
//             <DashboardLayout role="institution">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="flex flex-col items-center gap-3">
//                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//                         <p className="text-sm text-muted-foreground">Loading programs...</p>
//                     </div>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     return (
//         <DashboardLayout role="institution">
//             {/* Approval Warning */}
//             {!isApproved && (
//                 <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-start gap-3">
//                     <WarningIcon />
//                     <div>
//                         <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">
//                             Your Institution is Not Yet Approved
//                         </p>
//                         <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
//                             You cannot post new programs until your institution has been approved by an admin. Please complete your profile and wait for approval.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* Page Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//                 <div>
//                     <h1 className="text-2xl md:text-3xl font-bold">My Programs</h1>
//                     <p className="text-muted-foreground mt-1">
//                         {programs.length} program{programs.length !== 1 ? "s" : ""} posted
//                     </p>
//                 </div>

//                 <Dialog
//                     open={isDialogOpen}
//                     onOpenChange={(v) => {
//                         setIsDialogOpen(v);
//                         if (!v) { setEditingId(null); setForm(emptyProgram); }
//                     }}
//                 >
//                     <DialogTrigger asChild>
//                         <Button
//                             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
//                             disabled={!isApproved}
//                         >
//                             {isApproved ? <PlusIcon /> : <LockIcon />}
//                             {isApproved ? "Post New Program" : "Posting Disabled"}
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//                         <DialogHeader>
//                             <DialogTitle>{editingId ? "Edit Program" : "Create New Program"}</DialogTitle>
//                         </DialogHeader>
//                         <form onSubmit={handleSubmit} className="space-y-4 pt-2">
//                             <div className="space-y-2">
//                                 <Label className="text-sm font-medium">Program Title <span className="text-red-500">*</span></Label>
//                                 <Input
//                                     value={form.title}
//                                     onChange={(e) => setForm({ ...form, title: e.target.value })}
//                                     placeholder="e.g., BS Computer Science"
//                                     required
//                                     className="h-11"
//                                 />
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-medium">Category</Label>
//                                     <Input
//                                         value={form.category}
//                                         onChange={(e) => setForm({ ...form, category: e.target.value })}
//                                         placeholder="e.g., Computer Science"
//                                         className="h-11"
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-medium">Duration</Label>
//                                     <Input
//                                         value={form.duration}
//                                         onChange={(e) => setForm({ ...form, duration: e.target.value })}
//                                         placeholder="e.g., 4 Years"
//                                         className="h-11"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="space-y-2">
//                                 <Label className="text-sm font-medium">Eligibility</Label>
//                                 <Textarea
//                                     value={form.eligibility}
//                                     onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
//                                     placeholder="Entry requirements..."
//                                     className="resize-none"
//                                     rows={3}
//                                 />
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-medium">Deadline</Label>
//                                     <Input
//                                         type="date"
//                                         value={form.deadline}
//                                         onChange={(e) => setForm({ ...form, deadline: e.target.value })}
//                                         className="h-11"
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-medium">Application Method</Label>
//                                     <select
//                                         className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                         value={form.application_method}
//                                         onChange={(e) => setForm({ ...form, application_method: e.target.value })}
//                                     >
//                                         <option value="internal">Internal (via GAP)</option>
//                                         <option value="external">External URL</option>
//                                     </select>
//                                 </div>
//                             </div>
//                             {form.application_method === "external" && (
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-medium">External URL</Label>
//                                     <Input
//                                         type="url"
//                                         value={form.external_url}
//                                         onChange={(e) => setForm({ ...form, external_url: e.target.value })}
//                                         placeholder="https://..."
//                                         className="h-11"
//                                     />
//                                 </div>
//                             )}
//                             <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium">
//                                 {editingId ? "Update Program" : "Create Program"}
//                             </Button>
//                         </form>
//                     </DialogContent>
//                 </Dialog>
//             </div>

//             {/* Empty State */}
//             {programs.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center bg-card border border-dashed rounded-xl py-20 text-center px-4">
//                     <div className="mb-4">
//                         <BookOpenIcon />
//                     </div>
//                     <h3 className="text-lg font-semibold mb-1">No programs yet</h3>
//                     <p className="text-muted-foreground text-sm mb-6">
//                         Post your first program to start receiving student applications.
//                     </p>
//                     {isApproved && (
//                         <Button
//                             className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
//                             onClick={() => setIsDialogOpen(true)}
//                         >
//                             <PlusIcon />
//                             Post New Program
//                         </Button>
//                     )}
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {programs.map((program) => (
//                         <div
//                             key={program.id}
//                             className="bg-card rounded-xl border hover:shadow-md transition-all duration-200 flex flex-col"
//                         >
//                             {/* Card Header */}
//                             <div className="p-5 flex-1">
//                                 <div className="flex items-start justify-between gap-3 mb-4">
//                                     <h3 className="font-semibold text-base leading-snug">
//                                         {program.title}
//                                     </h3>
//                                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 border ${
//                                         program.is_active
//                                             ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
//                                             : "bg-muted text-muted-foreground border"
//                                     }`}>
//                                         <span className={`w-1.5 h-1.5 rounded-full ${
//                                             program.is_active ? "bg-emerald-500" : "bg-muted-foreground"
//                                         }`}></span>
//                                         {program.is_active ? "Active" : "Inactive"}
//                                     </span>
//                                 </div>

//                                 {/* Meta Info */}
//                                 <div className="space-y-2 mb-4">
//                                     {program.category && (
//                                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                             <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                                             </svg>
//                                             <span>{program.category}</span>
//                                         </div>
//                                     )}
//                                     {program.duration && (
//                                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                             <ClockIcon />
//                                             <span>{program.duration}</span>
//                                         </div>
//                                     )}
//                                     {program.deadline && (
//                                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                             <CalendarIcon />
//                                             <span>Deadline: {new Date(program.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
//                                         </div>
//                                     )}
//                                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                         <UsersIcon />
//                                         <span>{program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}</span>
//                                     </div>
//                                 </div>

//                                 {/* Application Method Badge */}
//                                 <Badge variant="secondary" className="text-xs">
//                                     {program.application_method === "external" ? "External Application" : "Apply via GAP"}
//                                 </Badge>
//                             </div>

//                             {/* Card Footer Actions */}
//                             <div className="px-5 pb-5 pt-0 flex gap-2 border-t mt-0 pt-4">
//                                 <Button
//                                     size="sm"
//                                     variant="outline"
//                                     className="flex-1 flex items-center justify-center gap-1.5 text-xs h-9"
//                                     onClick={() => handleEdit(program)}
//                                 >
//                                     <PencilIcon />
//                                     Edit
//                                 </Button>
//                                 <Button
//                                     size="sm"
//                                     variant="destructive"
//                                     className="flex items-center justify-center gap-1.5 text-xs h-9 px-3"
//                                     onClick={() => handleDelete(program.id)}
//                                 >
//                                     <TrashIcon />
//                                     Delete
//                                 </Button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </DashboardLayout>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Modal, Form, Input as AntInput, Select as AntSelect, DatePicker as AntDatePicker, Button as AntButton } from "antd";
import { ExclamationCircleFilled, BookOutlined, TagOutlined, ClockCircleOutlined, CalendarOutlined, LinkOutlined, SafetyCertificateOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";

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

/* ── Inline SVG Icons ─────────────────────────────────────────── */

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const PencilIcon = () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const BookOpenIcon = () => (
    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TagIcon = () => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

/* ── Main Page Component ──────────────────────────────────────── */

export default function InstitutionProgramsPage() {
    const { fetchWithAuth } = useApi();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyProgram);
    const [instStatus, setInstStatus] = useState<string>("pending");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const url = editingId
            ? `/institutions/programs/${editingId}`
            : "/institutions/programs";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success(editingId ? "Program updated successfully!" : "Program created successfully!");
                setIsDialogOpen(false);
                setEditingId(null);
                setForm(emptyProgram);
                loadPrograms();
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
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

    const handleDeleteRequest = (id: number) => {
        Modal.confirm({
            title: "Delete Program",
            icon: <ExclamationCircleFilled />,
            content: "Are you sure you want to delete this program? This action cannot be undone and will remove all associated data.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                const res = await fetchWithAuth(`/institutions/programs/${id}`, { method: "DELETE" });
                if (res.ok) {
                    toast.success("Program deleted successfully");
                    loadPrograms();
                } else {
                    toast.error("Failed to delete program");
                }
            },
        });
    };

    const isApproved = instStatus === "approved";

    /* Loading */
    if (isLoading) {
        return (
            <DashboardLayout role="institution">
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
        <DashboardLayout role="institution">

            {/* ── Approval Warning ───────────────────────────────────── */}
            {!isApproved && (
                <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <WarningIcon />
                    <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                            Your Institution is Not Yet Approved
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
                            You cannot post new programs until your institution has been approved by an admin. Please complete your profile and wait for approval.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Programs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {programs.length} program{programs.length !== 1 ? "s" : ""} posted
                    </p>
                </div>

                {/* ── Post Program Dialog ──────────────────────────────── */}
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(v) => {
                        setIsDialogOpen(v);
                        if (!v) { setEditingId(null); setForm(emptyProgram); }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 h-10 px-4 shadow-sm text-sm font-medium"
                            disabled={!isApproved}
                        >
                            {isApproved ? <PlusIcon /> : <LockIcon />}
                            {isApproved ? "Post New Program" : "Posting Disabled"}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingId ? "Edit Program" : "Create New Program"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {editingId ? "Update your program details below" : "Fill in the details to publish a new program"}
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

                            <Form.Item className="mb-0 pt-2">
                                <AntButton
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    icon={isSubmitting ? undefined : (editingId ? <EditOutlined /> : <PlusOutlined />)}
                                    size="large"
                                    block
                                    className="h-12 font-semibold text-[15px]"
                                    style={{ background: "linear-gradient(to right, #2563eb, #4f46e5)", borderColor: "transparent" }}
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
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl py-20 text-center px-4 bg-white dark:bg-card dark:border-border">
                    <BookOpenIcon />
                    <h3 className="text-base font-semibold mt-4 mb-1">No programs yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                        Post your first program to start receiving student applications.
                    </p>
                    {isApproved && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 h-10 px-4 text-sm"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <PlusIcon />
                            Post New Program
                        </Button>
                    )}
                </div>

            ) : (
                /* ── Program Cards Grid ───────────────────────────────── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            onRequestDelete={handleDeleteRequest}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

        </DashboardLayout>
    );
}

/* ── Program Card ─────────────────────────────────────────────── */

function ProgramCard({
    program,
    onEdit,
    onRequestDelete,
}: {
    program: Program;
    onEdit: (p: Program) => void;
    onRequestDelete: (id: number) => void;
}) {
    return (
        /*
         * Mirrors the Indeed card structure exactly:
         *  ┌──────────────────────────────────────┐
         *  │  [Active badge]       [Edit icon]    │
         *  │  Title (bold)                        │
         *  │  Category · Duration (muted)         │
         *  │                                      │
         *  │  [pill: applicants] [pill: method]   │
         *  │  ────────────────────────────────    │
         *  │  🗑 Delete                           │
         *  └──────────────────────────────────────┘
         */
        <div className="
            group relative bg-white dark:bg-card
            rounded-2xl border border-blue-100 dark:border-border
            shadow-sm p-5
            flex flex-col gap-3
            transition-all duration-200
            hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700
            cursor-pointer
        ">
            {/* Row 1 — status badge + edit icon */}
            <div className="flex items-start justify-between gap-3">

                {/* Left: badge + title + subtitle */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    {/* Status badge (mirrors the "New" badge from reference) */}
                    <span className={`
                        inline-flex items-center gap-1.5 self-start
                        rounded-full px-2.5 py-0.5 text-[11px] font-semibold
                        mb-1
                        ${program.is_active
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground"}
                    `}>
                        {program.is_active ? "Active" : "Inactive"}
                    </span>

                    {/* Program title */}
                    <h3 className="text-[15px] font-bold leading-snug text-gray-900 dark:text-foreground line-clamp-2">
                        {program.title}
                    </h3>

                    {/* Category + Duration (mirrors company + location) */}
                    <div className="text-[13px] text-gray-500 dark:text-muted-foreground leading-snug mt-0.5">
                        {program.category && <span>{program.category}</span>}
                        {program.category && program.duration && <span className="mx-1.5 opacity-40">·</span>}
                        {program.duration && (
                            <span className="inline-flex items-center gap-1">
                                <ClockIcon />
                                {program.duration}
                            </span>
                        )}
                    </div>

                    {/* Deadline if present */}
                    {program.deadline && (
                        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-muted-foreground mt-0.5">
                            <CalendarIcon />
                            <span>
                                Deadline:{" "}
                                {new Date(program.deadline).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}

                    {/* Eligibility / Requirements */}
                    {program.eligibility && (
                        <div className="flex items-start gap-1.5 text-[12px] text-gray-400 dark:text-muted-foreground mt-0.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span className="line-clamp-2">{program.eligibility}</span>
                        </div>
                    )}
                </div>

                {/* Right: Edit icon button (mirrors bookmark icon) */}
                <button
                    aria-label="Edit program"
                    onClick={() => onEdit(program)}
                    className="
                        flex-shrink-0 p-1.5 rounded-md
                        text-gray-400 dark:text-muted-foreground
                        hover:text-blue-600 hover:bg-blue-50
                        dark:hover:text-blue-400 dark:hover:bg-blue-900/30
                        transition-colors duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    "
                >
                    <PencilIcon />
                </button>
            </div>

            {/* Row 2 — pill chips (mirrors salary + job-type pills) */}
            <div className="flex flex-wrap gap-2">
                {/* Applicants pill */}
                <span className="
                    inline-flex items-center gap-1.5
                    border border-gray-200 dark:border-border
                    bg-gray-50 dark:bg-muted/50
                    rounded-full px-3 py-1
                    text-[12px] font-medium text-gray-600 dark:text-muted-foreground
                    whitespace-nowrap
                ">
                    <UsersIcon />
                    {program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}
                </span>

                {/* Application method pill */}
                <span className="
                    inline-flex items-center gap-1.5
                    border border-gray-200 dark:border-border
                    bg-gray-50 dark:bg-muted/50
                    rounded-full px-3 py-1
                    text-[12px] font-medium text-gray-600 dark:text-muted-foreground
                    whitespace-nowrap
                ">
                    {program.application_method === "external" ? (
                        <><ExternalLinkIcon />External</>
                    ) : (
                        <>via GAP</>
                    )}
                </span>
            </div>

            {/* Row 3 — Delete action (mirrors "Easily apply" footer row) */}
            <div className="pt-1 border-t border-gray-100 dark:border-border">
                <button
                    onClick={() => onRequestDelete(program.id)}
                    className="
                        flex items-center gap-1.5
                        text-[13px] font-medium text-red-500
                        hover:text-red-600
                        transition-colors duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded
                    "
                >
                    <TrashIcon />
                    Delete program
                </button>
            </div>
        </div>
    );
}