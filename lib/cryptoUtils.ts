import { NextResponse } from "next/server";

const enc = new TextEncoder();
const dec = new TextDecoder();

export function arrayBufferToBase64(buffer: ArrayBuffer) {
   let binary = '';
   const bytes = new Uint8Array(buffer);
   const chunkSize = 0x8000;
   for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as any);
   }
   return btoa(binary);
}

export function base64ToUint8Array(b64: string) {
   if (!b64) throw new Error("Invalid Base64 input: value is null/undefined");
   b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
   while (b64.length % 4) b64 += '=';
   return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}



export async function generateKeyPairAndEncrypt(password: string) {
   // create crypto object for pub and pri
   const { publicKey, privateKey } = await crypto.subtle.generateKey(
      {
         name: "RSA-OAEP",
         modulusLength: 4096,
         publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
         hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
   );

   // export to make browser readable 
   const exportedPublicKey = await crypto.subtle.exportKey("spki", publicKey);
   const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", privateKey);

   // make aes key
   const salt = crypto.getRandomValues(new Uint8Array(16));
   const passwordKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
   );

   const aesKey = await crypto.subtle.deriveKey(
      {
         name: "PBKDF2",
         hash: "SHA-256",
         salt,
         iterations: 300000
      },
      passwordKey,
      {
         name: "AES-GCM",
         length: 256,
      },
      false,
      ["encrypt", "decrypt"],
   );

   const iv = crypto.getRandomValues(new Uint8Array(12));
   const encryptedPrivateKey = await crypto.subtle.encrypt(
      {
         name: "AES-GCM",
         iv
      },
      aesKey,
      exportedPrivateKey
   );

   return {
      publicKey: arrayBufferToBase64(exportedPublicKey),
      encryptedPrivateKey: arrayBufferToBase64(encryptedPrivateKey),
      iv: arrayBufferToBase64(iv.buffer),
      salt: arrayBufferToBase64(salt.buffer),
      rawPrivateKey: exportedPrivateKey,
   };
}


export async function derivePrivateKey(password: string, encryptedPrivateKeyB64: string, ivB64: string, saltB64: string) {

   const encryptedPrivateKey = base64ToUint8Array(encryptedPrivateKeyB64);
   const iv = base64ToUint8Array(ivB64);
   const salt = base64ToUint8Array(saltB64);

   const passwordKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
   );

   const aesKey = await crypto.subtle.deriveKey(
      {
         name: "PBKDF2",
         hash: "SHA-256",
         salt,
         iterations: 300000,
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
   );

   try {
      const decrypted = await crypto.subtle.decrypt(
         { name: "AES-GCM", iv },
         aesKey,
         encryptedPrivateKey
      );
      return decrypted;

   } catch (err) {
      console.error("Failed to decrypt private key", err);
      return null;
   }



}
