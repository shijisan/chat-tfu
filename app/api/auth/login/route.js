import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {

    const { email, password } = await req.json();

    try {
        const user = await prisma.user.findFirst({
            where: { email },
            select: {id: true, password:true}
        });

        if (!user) {
            return NextResponse.json({ message: "User does not exist" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid password." }, { status: 401 });
        }

        const authToken = await createAuthToken(user.id);

        const useCookies = await cookies();

        useCookies.set("authToken", authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60,
        });

        return NextResponse.json({ message: "Login success", authToken }, { status: 200 });

    }
    catch (error) {
        return NextResponse.json({ message: "Failed to log in" }, { status: 500 });
    }


}

async function createAuthToken(userId) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);

    return (token);
}