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
