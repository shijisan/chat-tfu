import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "@/lib/redis";

export async function POST(req) {
    const { email, password } = await req.json();

    try {
        const user = await prisma.user.findFirst({
            where: { email },
            select: { id: true, password: true, encryptedKey: true },
        });

        if (!user) {
            return NextResponse.json({ message: "User does not exist" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid password." }, { status: 401 });
        }

        const [ivHex, encrypted] = user.encryptedKey.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const key = crypto.scryptSync(password, "salt", 32);
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decryptedKey = decipher.update(encrypted, "hex", "utf8");
        decryptedKey += decipher.final("utf8");

        await redis.set(`decryptedKey:${user.id}`, decryptedKey, "EX", 60 * 15);

        const authToken = await createAuthToken(user.id);

        const useCookies = await cookies();
        useCookies.set("authToken", authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60,
        });

        return NextResponse.json({ message: "Login success", authToken }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to log in" }, { status: 500 });
    }
}

async function createAuthToken(userId) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}
