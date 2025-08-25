import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
   const authUser = await auth();
   const userEmail = authUser?.user?.email;
   if (!userEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }
   const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { userAuth: { select: { publicKey: true } } }
   });

   if (!user?.userAuth?.publicKey) {
      return NextResponse.json({ message: "No public key found", publicKey: null }, { status: 404 });
   }

   return NextResponse.json({
      message: "User public key found",
      publicKey: user.userAuth.publicKey
   }, { status: 200 });

}