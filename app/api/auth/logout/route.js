import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(){
    try{

        const useCookies = await cookies();

        useCookies.delete("authToken");
        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    }
    catch (error){
        return NextResponse.json({ message: "Failed to log out" }, { status: 500 });
    }
}