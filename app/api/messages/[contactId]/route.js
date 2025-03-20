import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";
import crypto from "crypto";
import redis from "@/lib/redis";

function decryptSharedKey(encryptedKey, secret) {
    if (!encryptedKey || !secret) throw new Error("Missing key or secret");
    const [ivHex, encrypted] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = Buffer.alloc(32);
    Buffer.from(secret).copy(key, 0, 0, Math.min(Buffer.from(secret).length, 32));
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

function decryptMessage(encryptedMessage, secret) {
    const [ivHex, encrypted] = encryptedMessage.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = Buffer.alloc(32);
    Buffer.from(secret).copy(key, 0, 0, Math.min(Buffer.from(secret).length, 32));
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
        if (!userDecryptedKey) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

    
        const decryptedSharedKey = decryptSharedKey(contact.sharedUserKey, userDecryptedKey);

    
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { contactId: parseInt(contactId) },
                    { contactId: reverseContact.id },  
                ],
            },
            orderBy: { updatedAt: "asc" },
        });

    
        const decryptedMessages = messages.map((msg) => ({
            ...msg,
            content: decryptMessage(msg.content, decryptedSharedKey),
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

        const newMessage = await prisma.message.create({
            data: {
                contactId: parseInt(contactId),
                content: encryptedContent,
                reacts: "[]",
            },
        });

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        console.error("POST /api/messages/[contactId] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
