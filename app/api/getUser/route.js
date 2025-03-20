import { getUser } from "@/util/getUser";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const userId = await getUser();
        return NextResponse.json({message: "Fetched user successfully", userId}, {status: 201});
    }
    catch (error){
        return NextResponse.json({message: "Failed to get user"}, {status: 500});
    }
}