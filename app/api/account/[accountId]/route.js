import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req){
    const {accountId, newUsername} = await req.json();

    try{

        const usernameExists = await prisma.user.findUnique({
            where: {username: newUsername}
        })

        if (usernameExists){
            return NextResponse.json({message: "Username must be unique"}, {status: 400});
        }
        
        const editAccountUsername = await prisma.user.update({
            where: {id: accountId},
            data: {username: newUsername}
        })
    
        return NextResponse.json({message: "Username edited successfully", editAccountUsername}, {status: 201});
    }
    catch (error){
        return NextResponse.json({message: "Failed to edit username"}, {status: 500});
    }
}