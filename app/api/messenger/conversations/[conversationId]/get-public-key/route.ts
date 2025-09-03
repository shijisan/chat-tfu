import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type ConvoProps = {
   params: { conversationId: string };
};

export async function GET(__: NextRequest, { params }: ConvoProps) {
   const { conversationId } = await params;

   const authUser = await auth();
   const userEmail = authUser?.user?.email;

   if (!userEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }

   const userConvoMember = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { conversationMember: { select: { id: true } } }
   });

   if (!userConvoMember?.conversationMember?.length) {
      return NextResponse.json({ message: "User not part of any conversation" }, { status: 404 });
   }

   const currentMemberId = userConvoMember.conversationMember[0].id;

   const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
         conversationMember: {
            where: { NOT: { id: currentMemberId } },
            select: { id: true, user: { select: { userAuth: { select: { publicKey: true } } } } }
         }
      }
   });

   const recipient = conversation?.conversationMember?.[0];

   if (!recipient) {
      return NextResponse.json({ message: "Recipient not found" }, { status: 404 });
   }

   return NextResponse.json({ 
      message: "Recipient public key found", 
      otherUserPublicKey: recipient.user.userAuth?.publicKey 
   }, { status: 200 });
}