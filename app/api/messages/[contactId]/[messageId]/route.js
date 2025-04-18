import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";
import crypto from "crypto";
import redis from "@/lib/redis";

// Reuse the decryptSharedKey and encryptMessage functions from the GET/POST routes
function decryptSharedKey(encryptedKey, secret) {
    if (!encryptedKey || !secret) throw new Error("Missing key or secret");
    
    const [ivHex, encrypted] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const key = crypto.createHash("sha256").update(secret).digest(); // ✅ more reliable

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}


function encryptMessage(message, secret) {
    if (typeof message !== "string") throw new Error("Message must be a string");
    const iv = crypto.randomBytes(16);
    const key = Buffer.alloc(32);
    Buffer.from(secret).copy(key, 0, 0, Math.min(Buffer.from(secret).length, 32));
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}

export async function PATCH(req, { params }) {
    try {
        const { contactId, messageId } = await params;
        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Invalid message content" }, { status: 400 });
        }

        const currentUserId = await getUser();
        if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(contactId) },
            include: { friend: true },
        });

        if (!contact) return NextResponse.json({ error: "Contact does not exist" }, { status: 404 });
        if (contact.userId !== currentUserId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const redisKey = `decryptedKey:${currentUserId}`;
        const userDecryptedKey = await redis.get(redisKey);
        if (!userDecryptedKey) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

        const decryptedSharedKey = decryptSharedKey(contact.sharedUserKey, userDecryptedKey);
        const encryptedContent = encryptMessage(content, decryptedSharedKey);

        const updatedMessage = await prisma.message.update({
            where: {
                id: parseInt(messageId),
                contactId: parseInt(contactId),
            },
            data: {
                content: encryptedContent,
            },
        });

        return NextResponse.json({ success: true, message: updatedMessage }, { status: 200 });
    } catch (error) {
        console.error("Error updating message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { contactId, messageId } = params;
        const { emoji } = await req.json();

        if (!emoji?.trim()) {
            return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
        }

        const currentUserId = await getUser();
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const message = await prisma.message.findFirst({
            where: {
                id: parseInt(messageId),
                contactId: parseInt(contactId),
            },
            include: {
                contact: true,
            },
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.contact.userId !== currentUserId && message.contact.friendId !== currentUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const deletedReaction = await prisma.reaction.delete({
            where: {
                messageId_userId_emoji: {
                    messageId: parseInt(messageId),
                    userId: parseInt(currentUserId),
                    emoji,
                },
            },
        });

        return NextResponse.json({ success: true, message: "Reaction removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error removing reaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}