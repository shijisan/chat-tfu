import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyAuthToken(token){
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

    if (!authToken) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const payload = await verifyAuthToken(authToken);

    if (!payload) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    request.user = { id: payload.userId };

    return NextResponse.next();
}

export const config = {
    matcher: ["/account/:path*"], 
};