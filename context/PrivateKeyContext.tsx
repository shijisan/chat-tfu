"use client";

import { createContext, useContext, useState } from "react";
import { arrayBufferToBase64 } from "@/lib/cryptoUtils";

type PrivateKeyContextType = {
   privateKey: string | null;
   updatePrivateKey: (key: ArrayBuffer) => void;
   clearPrivateKey: () => void;
};

const PrivateKeyContext = createContext<PrivateKeyContextType | undefined>(undefined);

// set/check/clear private key from context
export function PrivateKeyProvider({ children }: { children: React.ReactNode }) {
   const [privateKey, setPrivateKeyState] = useState<string | null>(null);

   const updatePrivateKey = (key: ArrayBuffer) => {
      const keyB64 = arrayBufferToBase64(key);
      setPrivateKeyState(keyB64);
   };

   const clearPrivateKey = () => {
      setPrivateKeyState(null);
   };

   return (
      <PrivateKeyContext.Provider
         value={{
            privateKey,
            updatePrivateKey,
            clearPrivateKey,
         }}
      >
         {children}
      </PrivateKeyContext.Provider>
   );
}

// get private key
export function usePrivateKey() {
   const context = useContext(PrivateKeyContext);
   if (!context) {
      throw new Error("usePrivateKey must be used within a PrivateKeyProvider");
   }
   return context;
}
