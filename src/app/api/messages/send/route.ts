import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Apne prisma client ka sahi path check kar lein

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentId, instituteId, senderId, content } = body;

        if (!studentId || !instituteId || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Check karein ke kya pehle se conversation mojood hai
        let conversation = await prisma.conversation.findUnique({
            where: {
                studentId_instituteId: {
                    studentId: Number(studentId),
                    instituteId: Number(instituteId),
                },
            },
        });

        // 2. Agar nahi hai, toh nayi banayein
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    studentId: Number(studentId),
                    instituteId: Number(instituteId),
                },
            });
        }

        // 3. Message save karein
        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: Number(senderId),
                content: content,
            },
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error: any) {
        console.error("Message Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}