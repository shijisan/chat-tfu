import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type MessageProps = {
   params: Promise<{ conversationId: string }>
}

export type MessageSignature = {
   senderSignatureData: string;
   recipientSignatureData: string;
}

export async function POST(req: NextRequest, { params }: MessageProps) {

   const { conversationId } = await params;

   const userAuth = await auth();

   const userEmail = userAuth?.user?.email;

   if (!userEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }

   const user = await prisma.user.findUnique({
      where: {
         email: userEmail,
      },
      select: {
         id: true,
      }
   });

   const senderId = user?.id;

   const { recipientCipherText, senderCipherText, messageSignature } = await req.json() as {recipientCipherText: string, senderCipherText: string, messageSignature: MessageSignature};

   if (!conversationId) {
      return NextResponse.json({ message: "No conversation selected" }, { status: 401 });
   }

   if (!recipientCipherText || !senderCipherText || !senderId || !messageSignature) {
      return NextResponse.json({ message: "Message fields incomplete" }, { status: 401 });
   }

   const recipientSignature = messageSignature?.recipientSignatureData;
   const senderSignature = messageSignature?.senderSignatureData;
   

   const messageSent = await prisma.message.create({
      data: {
         recipientCipherText, senderCipherText, conversationId, senderId, recipientSignature, senderSignature
      },
   });

   return NextResponse.json({ message: "Message sent successfully", messageSent }, { status: 200 });

}