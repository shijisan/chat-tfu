"use client"

import { Card, CardHeader, CardTitle, CardContent, CardAction, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { Info, LogOut, Trash } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Account() {

   const { data: session } = useSession();

   return (
      <>
         <main className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="flex flex-col max-w-3xl gap-6">
               <Card>
                  <CardHeader>
                     <CardTitle>Your Account</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 items-center">
                     <Image src={session?.user?.image || "https://placehold.co/80/webp"}
                        alt={session?.user?.name || "User"}
                        height={80} width={80}
                        className="rounded-full size-20"
                     />
                     <div className="text-center">
                        <p>{session?.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                     </div>
                  </CardContent>
                  <CardFooter>
                     <small className="text-muted-foreground"><Info className="inline size-3" /> To make changes to your profile please update your Google Account Info.</small>
                  </CardFooter>
               </Card>
               <Card>
                  <CardHeader>
                     <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                     <CardAction className="w-full">
                        <Button className="text-xs w-full" onClick={() => signOut()}>
                           <LogOut className="inline" />
                           Sign Out
                        </Button>
                     </CardAction>
                     <CardAction className="w-full">
                        <Button className="text-xs w-full" variant="destructive">
                           <Trash className="inline" />
                           Delete Account
                        </Button>
                     </CardAction>


                  </CardContent>
               </Card>
            </div>
         </main>
      </>
   )
}