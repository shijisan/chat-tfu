import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(){
   const authUser = await auth();
   const userEmail = authUser?.user?.email;

   if (!userEmail){
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });   
   }

   const passwordExists = await prisma.user.findUnique({
   where: { email: userEmail },
   select: { password: true }
   });

   const hasPassword = !!passwordExists?.password;
   return NextResponse.json(hasPassword);

   
}

export async function POST(req: NextRequest) {
   const { password } = await req.json();
   const authUser = await auth();
   const userEmail = authUser?.user?.email;

   if (!userEmail) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
   }

   if (!password || password.length < 8) {
      return NextResponse.json({ message: "Password must be 8 characters long" }, { status: 400 });
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword }
   })

   return NextResponse.json({ message: "Updated user encryption password!", updatedUser }, { status: 200 });
}