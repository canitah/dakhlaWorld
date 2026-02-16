import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOtpEmail(to: string, otp: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@gap.pk",
            to,
            subject: "GAP - Your Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #1e40af; margin-bottom: 8px;">Global Admissions Platform</h1>
          <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
          <div style="background: #eff6ff; border: 2px solid #1e40af; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
        });
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
}

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Notification Email Templates ────────────────────────

function emailWrapper(title: string, body: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #2563eb; color: white; font-weight: bold; font-size: 18px; width: 40px; height: 40px; line-height: 40px; border-radius: 10px;">G</div>
        <h2 style="color: #111827; margin: 12px 0 4px;">${title}</h2>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
        ${body}
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
        © 2026 Global Admissions Platform. All rights reserved.
      </p>
    </div>`;
}

export async function sendInstitutionWelcomeEmail(to: string, institutionName: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@gap.pk",
            to,
            subject: "GAP - Welcome! Your Registration is Pending",
            html: emailWrapper(
                "Thank You for Registering!",
                `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Dear <strong>${institutionName}</strong>,
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Thank you for registering on the Global Admissions Platform (GAP). Your institution registration has been received and is currently <strong>pending approval</strong>.
                </p>
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #92400e; font-size: 14px; margin: 0;">
                        ⚠️ <strong>Important:</strong> Please complete your institution profile as soon as possible. Your registration <strong>cannot be approved</strong> until your profile is fully filled out (name, category, city, description, and contact email).
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    Log in to your dashboard and go to <strong>Profile</strong> to complete your details. Our admin team will review your registration once your profile is complete.
                </p>`
            ),
        });
        return true;
    } catch (error) {
        console.error("Institution welcome email error:", error);
        return false;
    }
}

export async function sendInstitutionApprovalEmail(to: string, institutionName: string, status: string) {
    const isApproved = status === "approved";
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@gap.pk",
            to,
            subject: `GAP - Institution ${isApproved ? "Approved" : "Update"}`,
            html: emailWrapper(
                isApproved ? "🎉 You're Approved!" : "Registration Update",
                isApproved
                    ? `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Dear <strong>${institutionName}</strong>,
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Great news! Your institution has been <strong style="color: #059669;">approved</strong> on the Global Admissions Platform.
                    </p>
                    <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p style="color: #065f46; font-size: 14px; margin: 0;">
                            ✅ You can now post programs, receive applications, and manage your institution dashboard.
                        </p>
                    </div>`
                    : `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Dear <strong>${institutionName}</strong>,
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Unfortunately, your institution registration has been <strong style="color: #dc2626;">rejected</strong>. Please contact our support team for more details.
                    </p>`
            ),
        });
        return true;
    } catch (error) {
        console.error("Institution approval email error:", error);
        return false;
    }
}

export async function sendApplicationSubmittedEmail(to: string, programTitle: string, institutionName: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@gap.pk",
            to,
            subject: "GAP - Application Submitted Successfully",
            html: emailWrapper(
                "Application Submitted!",
                `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Your application has been successfully submitted!
                </p>
                <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #1e40af; font-size: 14px; margin: 0 0 8px 0;">
                        <strong>Program:</strong> ${programTitle}
                    </p>
                    <p style="color: #1e40af; font-size: 14px; margin: 0;">
                        <strong>Institution:</strong> ${institutionName}
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    You can track your application status from your dashboard. The institution will review your application and you'll be notified of any updates.
                </p>`
            ),
        });
        return true;
    } catch (error) {
        console.error("Application submitted email error:", error);
        return false;
    }
}

export async function sendApplicationStatusEmail(to: string, programTitle: string, status: string) {
    const isAccepted = status === "accepted";
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@gap.pk",
            to,
            subject: `GAP - Application ${isAccepted ? "Accepted" : "Update"}: ${programTitle}`,
            html: emailWrapper(
                isAccepted ? "🎉 Congratulations!" : "Application Update",
                isAccepted
                    ? `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Your application for <strong>${programTitle}</strong> has been <strong style="color: #059669;">accepted</strong>!
                    </p>
                    <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p style="color: #065f46; font-size: 14px; margin: 0;">
                            ✅ Congratulations! Please check your dashboard for next steps and further instructions from the institution.
                        </p>
                    </div>`
                    : `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Your application for <strong>${programTitle}</strong> has been <strong style="color: #dc2626;">rejected</strong>.
                    </p>
                    <p style="color: #6b7280; font-size: 14px;">
                        Don't be discouraged — browse other programs on GAP and keep applying!
                    </p>`
            ),
        });
        return true;
    } catch (error) {
        console.error("Application status email error:", error);
        return false;
    }
}
