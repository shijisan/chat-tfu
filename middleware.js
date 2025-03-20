import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyAuthToken(token) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

export async function middleware(request) {
    const authToken = request.cookies.get("authToken")?.value;
    const currentUrl = request.nextUrl.clone();

    if (!authToken) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", currentUrl.pathname + currentUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAuthToken(authToken);

    if (!payload) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", currentUrl.pathname + currentUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    request.user = { id: payload.userId };
    return NextResponse.next();
}

export const config = {
    matcher: ["/account/:path*", "/contacts/:path*"],
};
