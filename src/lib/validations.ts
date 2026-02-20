import { z } from "zod";

// ─── Auth Validations ────────────────────────────────────
export const signupSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["student", "institution"]),
}).refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
});

export const loginSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(1, "Password is required"),
}).refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
});

export const otpSchema = z.object({
    userId: z.number(),
    code: z.string().length(6, "OTP must be 6 digits"),
});

export const sendOtpSchema = z.object({
    email: z.string().email(),
    type: z.enum(["signup", "login", "reset"]).default("signup"),
});

// ─── Student Profile ─────────────────────────────────────
export const studentProfileSchema = z.object({
    student_type: z.enum(["local", "international"]).optional(),
    full_name: z.string().min(2).max(100).optional(),
    city: z.string().max(100).optional(),
    age_range: z.string().optional(),
    intended_field: z.string().max(200).optional(),
    personal_statement: z.string().max(2000).optional(),
    education_level: z.string().optional(),
    experience_level: z.string().optional(),
    learning_goal: z.string().max(500).optional(),
});

// ─── Institution Profile ─────────────────────────────────
export const institutionProfileSchema = z.object({
    name: z.string().min(2).max(200),
    category: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    description: z.string().max(3000).optional(),
    contact_email: z.string().email().optional(),
});

// ─── Program ─────────────────────────────────────────────
export const programSchema = z.object({
    title: z.string().min(2).max(200),
    category: z.string().max(100).optional(),
    duration: z.string().max(100).optional(),
    eligibility: z.string().max(2000).optional(),
    deadline: z.string().optional(), // ISO date string
    application_method: z.enum(["internal", "external"]).optional(),
    external_url: z.string().url().optional().nullable(),
    is_active: z.boolean().optional(),
});

// ─── Application ─────────────────────────────────────────
export const applicationSchema = z.object({
    program_id: z.number().int().positive(),
});

export const applicationStatusSchema = z.object({
    status: z.enum(["submitted", "viewed", "accepted", "rejected"]),
});

// ─── Billing ─────────────────────────────────────────────
export const paymentRequestSchema = z.object({
    plan_id: z.number().int().positive(),
    transaction_ref: z.string().max(200).optional(),
    screenshot_url: z.string().url().optional(),
});

// ─── Admin ───────────────────────────────────────────────
export const categorySchema = z.object({
    name: z.string().min(1).max(100),
});

export const citySchema = z.object({
    name: z.string().min(1).max(100),
});

export const approvalSchema = z.object({
    status: z.enum(["approved", "rejected", "cancelled"]),
    reason: z.string().optional(),
});
