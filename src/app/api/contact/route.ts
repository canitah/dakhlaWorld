import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        // Aapke existing SMTP credentials use ho rahe hain
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER, // .env se uthayega
                pass: process.env.SMTP_PASS, // .env se uthayega
            },
        });

        const mailOptions = {
    // 1. Sender address mein '+contact' add kar dein
    from: `"${name} (Dakhla Inquiry)" <dakhla.world+contact@gmail.com>`, 
    
    // 2. Receiving address wahi purana rahega
    to: 'dakhla.world@gmail.com',
    
    replyTo: email, 
    subject: `New Message: ${subject}`,
    html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #008cff; border-radius: 10px;">
            <h2 style="color: #008cff;">Contact Form Submission</h2>
            <p><strong>Sender Name:</strong> ${name}</p>
            <p><strong>Sender Email:</strong> ${email}</p>
            <hr />
            <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px;">${message}</p>
        </div>
    `,
};

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Contact Email Error:", error);
        return NextResponse.json({ success: false, error: "Email sending failed" }, { status: 500 });
    }
}