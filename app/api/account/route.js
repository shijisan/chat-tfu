import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const userId = await getUser();

        const user = await prisma.user.findFirst({
            where: {id: userId},
        })

        return NextResponse.json({message: "Fetched user successfully", user}, {status: 201});
    }
    catch (error){
        return NextResponse.json({message: "Failed to get user"}, {status: 500});
    }
}