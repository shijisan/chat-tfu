"use client"

import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function Auth() {


   const handleSignIn = () => {
      try {
         signIn("google", {redirectTo: "/messenger"});
      } catch (err) {
         console.error("Failed to sign in with Google", err);
      }
   }



   return (
      <>
         <main className="flex items-center justify-center min-h-screen w-full">
            <Card>
               <CardHeader>
                  <CardTitle>
                     Login
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <CardAction>
                     <Button onClick={handleSignIn}><LogIn /> Sign in with Google</Button>
                  </CardAction>
               </CardContent>
            </Card>
         </main>
      </>
   )
}