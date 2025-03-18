import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";

export const runtime = "nodejs";

export async function GET(req, { params }) {
    const { contactId } = await params;

    if (!contactId) {
        return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
    }

    // Get the current user's ID
    const currentUserId = await getUser();
    if (!currentUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the contact to verify ownership
    const contact = await prisma.contact.findUnique({
        where: { id: parseInt(contactId) },
        include: { user: true }, // Include the user who owns the contact
    });

    if (!contact) {
        return NextResponse.json({ error: "Contact does not exist" }, { status: 404 });
    }

    // Ensure the current user owns the contact
    if (contact.userId !== currentUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages from the database
    const messages = await prisma.message.findMany({
        where: { contactId: parseInt(contactId) },
        orderBy: { updatedAt: "asc" },
    });

    return NextResponse.json(messages);
}

export async function POST(req, { params }) {
    try {
        const { contactId } = await params;
        const { content } = await req.json();

        if (!contactId || !content.trim()) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Get the current user's ID
        const currentUserId = await getUser();
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the contact to verify ownership
        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(contactId) },
            include: { user: true }, // Include the user who owns the contact
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact does not exist" }, { status: 404 });
        }

        // Ensure the current user owns the contact
        if (contact.userId !== currentUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Save message to database
        const newMessage = await prisma.message.create({
            data: {
                contactId: parseInt(contactId),
                content,
                reacts: "[]",
            },
        });

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        console.error("POST /api/messages/[contactId] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}