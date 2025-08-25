import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


export async function GET(){
   const authUser = await auth();

   const userEmail = authUser?.user?.email;

   if (!userEmail){
      return NextResponse.json({message: "User not authenticated"}, {status: 401});
   }

   const user = await prisma.user.findUnique({
      where: {email: userEmail},
      select: {
         id: true
      }
   })

   return NextResponse.json({message: "Found user id", user}, {status: 200});
}