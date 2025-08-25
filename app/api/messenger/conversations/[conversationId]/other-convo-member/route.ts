import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type OtherConvoMemberProps = {
   params: Promise<{conversationId: string}>,
}

export async function GET(__: NextRequest, {params}: OtherConvoMemberProps){
   const {conversationId} = await params;

   if (!conversationId) {
      return NextResponse.json({message: "No conversation id provided"}, {status: 401});
   }

   const authUser = await auth();

   const userEmail = authUser?.user?.email;

   if (!userEmail) {
      return NextResponse.json({message: "User not authenticated"}, {status: 405});
   }

   const user = await prisma.user.findUnique({
      where:{email: userEmail},
      select:{id: true},
   });

   const userId = user?.id;

   if (!userId) {
      return NextResponse.json({message: "User id not found"}, {status: 404});
   }

   const otherConvoMember = await prisma.conversationMember.findFirst({
   where: {
      conversationId,
      NOT: {
         userId: userId,
      },
   },
   select: {
      user: {
         select: {
         name: true, email: true, image: true,
         },
      },
   },
   });

   return NextResponse.json({message: "Other convo member found", otherConvoMember}, {status: 200});

}