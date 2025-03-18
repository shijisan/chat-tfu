import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req){
    const {username, email, password} = await req.json();

    try{

        const userCheck = await prisma.user.findUnique({
            where: {email},
        });

        if (!userCheck){

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    username, email, password: hashedPassword,
                }
            })
            return NextResponse.json({message: "Successfully created your account"}, {status: 201});

        }
        else{
            return NextResponse.json({message: "Email already in use"}, {status: 402});
        }

    }
    catch (error){
        return NextResponse.json({message: "Error creating your account"}, {status: 500});
    }
}