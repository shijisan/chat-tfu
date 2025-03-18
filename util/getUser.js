import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUser(){
    try{
        const useCookie = await cookies();
        const token = useCookie.get("authToken")?.value;
        if (!token) return null;
        const {payload} = await jwtVerify(token, SECRET_KEY);
        return payload.userId;
    }
    catch (error){
        return null;
    }
}