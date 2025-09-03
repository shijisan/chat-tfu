import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { MessageSignature } from "../conversations/[conversationId]/message/route";

export async function POST(req: NextRequest) {

   const { recipientEmail, senderCipherText, recipientCipherText, conversationId, messageSignature } = await req.json() as {recipientEmail: string, recipientCipherText: string, senderCipherText: string, conversationId: string, messageSignature: MessageSignature};

   const authUser = await auth();

   const senderEmail = authUser?.user?.email;

   if (!senderEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }

   const sender = await prisma.user.findUniqueOrThrow({
      where: { email: senderEmail },
      select: {
         id: true
      },
   })

   const senderId = sender?.id;


   const recipient = await prisma.user.findUniqueOrThrow({
      where: {email: recipientEmail},
      select: {id: true},
   });


   const recipientId = recipient?.id;


   const newConversation = await prisma.conversation.create({
      data: {
         conversationMember: {
            create: [
               { userId: senderId },
               { userId:  recipientId}
            ],
         },
      },
   });

   const newConversationId = newConversation.id;

   const recipientSignature = messageSignature.recipientSignatureData;
   const senderSignature = messageSignature.senderSignatureData;


   const createMessage = await prisma.message.create({
      data: {
         recipientCipherText, senderCipherText, conversationId: conversationId || newConversationId, senderId, recipientSignature, senderSignature
      }
   })

   return NextResponse.json({ message: "Message sent successfully", createMessage }, { status: 200 });

}