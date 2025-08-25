import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ConvoMessageProps = {
  params: Promise<{ conversationId: string }>,
}

export async function POST(
  req: NextRequest,
  { params }: ConvoMessageProps
) {
  const { conversationId } = await params;
  const { messageCount, userId } = await req.json();

  if (isNaN(messageCount)) {
    return NextResponse.json(
      { message: "Given message count must be a number" },
      { status: 401 }
    );
  }

  if (!conversationId) {
    return NextResponse.json({ message: "No conversation Id" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ message: "No user Id provided" }, { status: 401 });
  }

  const conversationMember = await prisma.conversationMember.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });

  if (!conversationMember) {
    return NextResponse.json(
      { message: "User is not a member of this conversation" },
      { status: 403 }
    );
  }

  const fetchedMessages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    include: {
      sender: {
        include: {
          conversationMember: {
            include: { user: true },
            where: {conversationId},
          },
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    skip: messageCount || 0,
  });


  return NextResponse.json(
    { message: "Fetched messages", fetchedMessages },
    { status: 200 }
  );
}
