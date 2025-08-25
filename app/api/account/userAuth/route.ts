import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(){
   const authUser = await auth();
   const userEmail = authUser?.user?.email;

   if (!userEmail){
      return NextResponse.json({message: "User not authenticated"}, {status: 401})
   }

   const user = await prisma.user.findUnique({
      where: {email: userEmail},
      select: {id: true},
   });

   if (!user){
      return NextResponse.json({message: "User not found"}, {status: 404})
   }

   const userId = user.id;

   if (!userId){
      return NextResponse.json({message: "User Id not found"}, {status: 404})
   }

   const userAuth = await prisma.userAuth.findUnique({
      where: {userId},
      select: {encryptedPrivateKey: true, salt: true, iv: true, publicKey: true},
   });

   return NextResponse.json({ message: "User Auth found", userAuth }, { status: 200 });
}

export async function POST(req: NextRequest) {
   const authUser = await auth();
   const userEmail = authUser?.user?.email;
   const { publicKey, encryptedPrivateKey, salt, iv } = await req.json();

   if (!userEmail){
      return NextResponse.json({message: "User not authenticated"}, {status: 401})
   }

   if (!publicKey || !encryptedPrivateKey || !salt || !iv) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
   }

   const user = await prisma.user.findUnique({
      where: {email: userEmail},
      select: {id: true}
   })

   const userId = user?.id;

   if (!userId){
      return NextResponse.json({ message: "User Id not found" }, { status: 400 })
   }

   const userAuthExists = await prisma.userAuth.findUnique({
      where: {userId: userId}
   });

   if (userAuthExists){
      return NextResponse.json({ message: "User Auth already exists" }, {status: 409});
   }

   const createdUserAuth = await prisma.userAuth.create({
      data: {
         userId, publicKey, encryptedPrivateKey, salt, iv
      },
   });

   return NextResponse.json({ message: "User auth created successfully", createdUserAuth }, { status: 200 });


}