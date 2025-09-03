"use client"

import { base64ToUint8Array, arrayBufferToBase64 } from "./cryptoUtils";
const enc = new TextEncoder();
const dec = new TextDecoder();

async function privateKeyB64ToCrypto(privateKeyB64: string, usage: "sign" | "decrypt"): Promise<CryptoKey> {

  if (!privateKeyB64 || !usage) {
    throw new Error(`Missing privateKeyB64/usage: ${privateKeyB64}, ${usage}`);
  }

  const privateKeyByte = base64ToUint8Array(privateKeyB64);

  const algo = usage === "sign" ? "RSA-PSS" : "RSA-OAEP";

  const cryptoPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyByte,
    {
      name: algo,
      hash: "SHA-256"
    },
    false,
    [usage]
  );

  return cryptoPrivateKey;

}

async function publicKeyB64ToCrypto(publicKey: string, usage: "encrypt" | "verify") {

  if (!publicKey || !usage) {
    throw new Error(`Missing privateKeyB64/usage: ${publicKey}, ${usage}`);
  }

  const publicKeyBytes = base64ToUint8Array(publicKey);

  const algo = usage === "encrypt" ? "RSA-OAEP" : "RSA-PSS";

  const importedPublicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBytes,
    {
      name: algo,
      hash: "SHA-256"
    },
    false,
    [usage]
  );

  return importedPublicKey;

}

export async function encryptMessage(
  message: string,
  recipientPublicKeyB64: string
) {

  try {
    if (!message || !recipientPublicKeyB64) {
      const error = {
        "errMsg": "Missing message/recipientPublicKeyB64",
        "errVals": `${message}\n${recipientPublicKeyB64}`,
      }
      throw new Error(`${error.errMsg} error.errVals`)
    }

    const importedPublicKey = await publicKeyB64ToCrypto(recipientPublicKeyB64, "encrypt");

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
  } catch (err) {
    console.error(err);
  }

}

export async function decryptMessage(
  ciphertextB64: string,
  recipientPrivateKeyB64: string
) {

  try {
    if (!ciphertextB64 || !recipientPrivateKeyB64) {
      const error = {
        "errMsg": "Missing cipherTextB64/recipientPrivateKey64\n",
        "errVals": `${ciphertextB64}\n${recipientPrivateKeyB64}`
      };
      throw new Error(`${error.errMsg} error.errVals`)
    }

    const ciphertext = base64ToUint8Array(ciphertextB64);
    const importedPrivateKey = await privateKeyB64ToCrypto(recipientPrivateKeyB64, "decrypt");

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      importedPrivateKey,
      ciphertext
    );

    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.error(err);
  }

}

export async function signMessage( 
  recipientCipherText: string,
  senderPrivateKeyB64: string,
) {

  try {
    if (!recipientCipherText || !senderPrivateKeyB64) {
      const error = {
        "errMsg": "Missing senderCipherText/recipientCipherText/senderPrivatekeyB64",
        "errVals": `${recipientCipherText}\n${senderPrivateKeyB64}`
      }
      throw new Error(`${error.errMsg} error.errVals`)
    }

    const recipientData = enc.encode(recipientCipherText);
    const importedPrivateKey = await privateKeyB64ToCrypto(senderPrivateKeyB64, "sign");

    const recipientSignature = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      importedPrivateKey,
      recipientData
    );

    const recipientSignatureData = arrayBufferToBase64(recipientSignature);

    return recipientSignatureData;
  } catch (err) {
    console.error(err);
  }

}

export async function verifyMessage(
  cipherText: string,
  signatureB64: string,
  publicKey: string
) {

  try {
    if (!publicKey) {
      const error = {
        "errMsg": "Missing public key:",
        "errVals": `${publicKey}`,
      }
      throw new Error(`${error.errMsg} error.errVals`)
    }

    if (!cipherText || !signatureB64) {
      const error = {
        "errMsg": "Missing cipherText or/and signature",
        "errVals": `${cipherText}, ${signatureB64}`
      };

      throw new Error(`${error.errMsg} error.errVals`)
    }

    const importedPublicKey = await publicKeyB64ToCrypto(publicKey, "verify");

    const data = enc.encode(cipherText);

    const signatureByte = base64ToUint8Array(signatureB64);

    const verified = await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      importedPublicKey,
      signatureByte,
      data
    );

    return verified;
  } catch (err) {
    console.error(err);
  }

}