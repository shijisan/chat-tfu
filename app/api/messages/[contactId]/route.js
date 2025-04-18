import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";
import crypto from "crypto";
import redis from "@/lib/redis";

function decryptSharedKey(encryptedKey, secret) {
    if (!encryptedKey || !secret) throw new Error("Missing key or secret");
    const [ivHex, encrypted] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    
    // Use the secret directly (ensure it's 32 bytes)
    const key = Buffer.alloc(32);
    Buffer.from(secret, "hex").copy(key); // Truncate or pad to 32 bytes

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

function encryptMessage(message, secret) { // Remove `salt`
    if (typeof message !== "string") throw new Error("Message must be a string");
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(secret, "hex"); // Convert hex string to buffer directly
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}

function decryptMessage(encryptedMessage, secret) { // Remove `salt`
    const [ivHex, encrypted] = encryptedMessage.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = Buffer.from(secret, "hex"); // Convert hex string to buffer directly
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export const runtime = "nodejs";

export async function GET(req, { params }) {
    try {
        const { contactId } = await params;
        if (!contactId) return NextResponse.json({ error: "Missing contactId" }, { status: 400 });

        const currentUserId = await getUser();
        if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch the current user's salt
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { salt: true },
        });
        if (!currentUser || !currentUser.salt) {
            return NextResponse.json({ error: "User salt not found" }, { status: 404 });
        }
        const salt = currentUser.salt;

        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(contactId) },
            include: { friend: true },
        });

        if (!contact) return NextResponse.json({ error: "Contact does not exist" }, { status: 404 });
        if (contact.userId !== currentUserId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const reverseContact = await prisma.contact.findFirst({
            where: {
                userId: contact.friendId,
                friendId: contact.userId,
            },
        });

        if (!reverseContact) return NextResponse.json({ error: "Reverse contact not found" }, { status: 404 });

        const redisKey = `decryptedKey:${currentUserId}`;
        const userDecryptedKey = await redis.get(redisKey);

        console.log("user decrypted key:", userDecryptedKey);

        if (!userDecryptedKey) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

        // Decrypt the shared key using the salt
        const decryptedSharedKey = decryptSharedKey(contact.sharedUserKey, userDecryptedKey);


        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { contactId: parseInt(contactId) },
                    { contactId: reverseContact.id },
                ],
            },
            orderBy: { updatedAt: "asc" },
            include: {
                reactions: {
                    include: { user: true },
                },
            },
        });

        const decryptedMessages = messages.map((msg) => ({
            ...msg,
            content: decryptMessage(msg.content, decryptedSharedKey),
            reacts: msg.reactions.map((reaction) => ({
                id: reaction.id,
                userId: reaction.userId,
                emoji: reaction.emoji,
            })),
        }));

        return NextResponse.json(decryptedMessages);
    } catch (error) {
        console.error("GET /api/messages/[contactId] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { contactId } = await params;
        const { content } = await req.json();

        if (!contactId || !content?.trim()) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const currentUserId = await getUser();
        if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch the current user's salt
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { salt: true },
        });
        if (!currentUser || !currentUser.salt) {
            return NextResponse.json({ error: "User salt not found" }, { status: 404 });
        }
        const salt = currentUser.salt;

        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(contactId) },
            include: { friend: true },
        });

        if (!contact) return NextResponse.json({ error: "Contact does not exist" }, { status: 404 });
        if (contact.userId !== currentUserId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const redisKey = `decryptedKey:${currentUserId}`;
        const userDecryptedKey = await redis.get(redisKey);
        if (!userDecryptedKey) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

        // Decrypt the shared key using the salt
        const decryptedSharedKey = decryptSharedKey(contact.sharedUserKey, userDecryptedKey);


        // Encrypt the message content using the salt
        const encryptedContent = encryptMessage(content, decryptedSharedKey);

        const newMessage = await prisma.message.create({
            data: {
                contactId: parseInt(contactId),
                senderId: currentUserId,
                content: encryptedContent,
            },
        });

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        console.error("POST /api/messages/[contactId] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}