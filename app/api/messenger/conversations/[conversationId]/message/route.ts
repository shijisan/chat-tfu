import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type MessageProps = {
   params: Promise<{ conversationId: string }>
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

   const { recipientCipherText, senderCipherText, recipientSignature } = await req.json();

   if (!conversationId) {
      return NextResponse.json({ message: "No conversation selected" }, { status: 401 });
   }

   if (!recipientCipherText || !senderCipherText || !senderId || !recipientSignature) {
      return NextResponse.json({ message: "Message fields incomplete" }, { status: 401 });
   }
   

   const messageSent = await prisma.message.create({
      data: {
         recipientCipherText, senderCipherText, conversationId, senderId, recipientSignature
      },
   });

   return NextResponse.json({ message: "Message sent successfully", messageSent }, { status: 200 });

}