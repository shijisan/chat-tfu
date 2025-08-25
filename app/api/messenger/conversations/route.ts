import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
   const authUser = await auth();
   const authUserEmail = authUser?.user?.email;

   if (!authUserEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }

   const convoUser = await prisma.user.findUnique({
      where: { email: authUserEmail },
      select: { id: true },
   });

   const userId = convoUser?.id;

   const conversations = await prisma.conversation.findMany({
      where: {
         conversationMember: {
            some: { userId },
         },
      },
      select: {
         id: true,
         createdAt: true,
         Message: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
               id: true,
               senderCipherText: true,
               recipientCipherText: true,
               senderId: true,
               createdAt: true,
            },
         },
         conversationMember: {
            where: { NOT: { userId } }, 
            select: {
               user: {
                  select: { id: true, name: true, email: true, image: true },
               },
            },
         },
      },
      orderBy: { createdAt: "desc" },
   });


   return NextResponse.json({ message: "Fetched conversations", conversations }, { status: 200 });
}