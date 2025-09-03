"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { generateKeyPairAndEncrypt } from "@/lib/cryptoUtils";
import { usePrivateKey } from "@/context/PrivateKeyContext";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetPassword() {

   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const router = useRouter();
   const { updatePrivateKey, privateKey } = usePrivateKey();

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

      e.preventDefault();

      if (password === confirmPassword) {
         try {
            const res = await fetch("/api/account/set-password", {
               method: "POST",
               headers: {
                  "Content-type": "application/json",
               },
               body: JSON.stringify({ password })
            });

            if (res.ok) {

               const { rawPrivateKey, publicKey, encryptedPrivateKey, salt, iv } = await generateKeyPairAndEncrypt(password);

               updatePrivateKey(rawPrivateKey);

               const authRes = await fetch("/api/account/userAuth", {
                  method: "POST",
                  headers: {
                     "Content-type": "application/json",
                  },
                  body: JSON.stringify({
                     publicKey, encryptedPrivateKey, salt, iv
                  }),
               })

               if (authRes.ok) {
                  router.push("/messenger");
               }

            }
         }
         catch (err) {
            console.error("Failed to set encryption password", err);
         }
      }
   }

   useEffect(() => {
      if (privateKey) {
         router.push("/messenger");
      }
   }, [privateKey, router])

   return (
      <>
         <main className="min-h-screen w-full flex items-center justify-center">
            <Card className="max-w-sm w-full">
               <CardHeader>
                  <CardTitle>Create Encryption Password</CardTitle>
               </CardHeader>

               <CardContent>
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                           name="password"
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Create your encryption password"
                           required
                        />
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <Input
                           name="confirmPassword"
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="Confirm your encryption password"
                           required
                        />
                     </div>

                     <Button type="submit" className="w-full">
                        Submit
                     </Button>
                  </form>
               </CardContent>

               <CardFooter className="flex justify-center">
                  <Button variant="link" asChild>
                     <Link href="/">Back home</Link>
                  </Button>
               </CardFooter>
            </Card>
         </main>
      </>
   )
}