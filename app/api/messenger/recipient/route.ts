import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
   const {recipientEmail} = await req.json();

   if (!recipientEmail){
      return NextResponse.json({message: "No recipient email provided"}, {status: 401});
   }

   const recipientInfo = await prisma.user.findUnique({
      where: {email: recipientEmail},
      select: {
         id: true, userAuth: {
            select: {
               publicKey: true,
            },
         },
      },
   });

   return NextResponse.json({message: "Found recipient info", recipientInfo}, {status: 200});
}