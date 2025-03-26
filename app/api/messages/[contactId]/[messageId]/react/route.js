import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";

// Add or Replace Reaction (POST)
export async function POST(req, { params }) {
    try {
        const { messageId } = await params; // Remove contactId from params
        const { emoji } = await req.json();

        // Validate input
        if (!emoji?.trim()) {
            return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
        }

        // Authenticate user
        const currentUserId = await getUser();
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the message to validate permissions and existence
        const message = await prisma.message.findUnique({
            where: {
                id: parseInt(messageId), // Filter by message ID only
            },
            include: {
                contact: true,
            },
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Ensure the user has access to the contact
        if (message.contact.userId !== currentUserId && message.contact.friendId !== currentUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if the user has already reacted to this message
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                messageId_userId: {
                    messageId: parseInt(messageId),
                    userId: parseInt(currentUserId),
                },
            },
        });

        let updatedReaction;

        if (existingReaction) {
            // Update the existing reaction with the new emoji
            updatedReaction = await prisma.reaction.update({
                where: {
                    id: existingReaction.id,
                },
                data: {
                    emoji,
                },
            });
        } else {
            // Create a new reaction
            updatedReaction = await prisma.reaction.create({
                data: {
                    messageId: parseInt(messageId),
                    userId: parseInt(currentUserId),
                    emoji,
                    contactId: message.contactId, // Use the message's contactId
                },
            });
        }

        return NextResponse.json({ success: true, reaction: updatedReaction }, { status: 200 });
    } catch (error) {
        console.error("Error adding or updating reaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Remove Reaction (DELETE)
export async function DELETE(req, { params }) {
    try {
        const { messageId } = await params; // Remove contactId from params

        // Authenticate user
        const currentUserId = await getUser();
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the message to validate permissions and existence
        const message = await prisma.message.findUnique({
            where: {
                id: parseInt(messageId), // Filter by message ID only
            },
            include: {
                contact: true,
            },
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Ensure the user has access to the contact
        if (message.contact.userId !== currentUserId && message.contact.friendId !== currentUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the user's reaction to the message
        const deletedReaction = await prisma.reaction.delete({
            where: {
                messageId_userId: {
                    messageId: parseInt(messageId),
                    userId: parseInt(currentUserId),
                },
            },
        });

        return NextResponse.json({ success: true, message: "Reaction removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error removing reaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}