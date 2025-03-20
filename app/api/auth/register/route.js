import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
    const { username, email, password } = await req.json();

    try {
        const userCheck = await prisma.user.findUnique({
            where: { email },
        });

        if (!userCheck) {
            const encryptionKey = crypto.randomBytes(32).toString("hex");
            const iv = crypto.randomBytes(16);
            const key = crypto.scryptSync(password, "salt", 32);
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
            let encryptedKey = cipher.update(encryptionKey, "utf8", "hex");
            encryptedKey += cipher.final("hex");
            const encryptedKeyWithIV = `${iv.toString("hex")}:${encryptedKey}`;

            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    encryptedKey: encryptedKeyWithIV,
                },
            });

            return NextResponse.json({ message: "Successfully created your account" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error creating your account" }, { status: 500 });
    }
}