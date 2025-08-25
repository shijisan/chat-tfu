"use client"

import { base64ToUint8Array } from "./cryptoUtils";

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function encryptMessage(
  message: string,
  recipientPublicKeyB64: string
) {
  const publicKeyBytes = base64ToUint8Array(recipientPublicKeyB64);
  
  const importedPublicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    importedPublicKey,
    enc.encode(message)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  };
}

export async function decryptMessage(
  ciphertextB64: string,
  recipientPrivateKeyB64: string
) {
  const ciphertext = base64ToUint8Array(ciphertextB64);
  const privateKeyBytes = base64ToUint8Array(recipientPrivateKeyB64);
  
  const importedPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    importedPrivateKey,
    ciphertext
  );

  return dec.decode(decryptedBuffer);
}