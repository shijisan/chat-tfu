// context/PublicKeyContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

type PublicKeyContextType = {
  publicKey: string | null;
  setPublicKey: (key: string) => void;
  isLoading: boolean;
  error: string | null;
};

const PublicKeyContext = createContext<PublicKeyContextType | undefined>(undefined);

export const PublicKeyProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchKey() {
      if (publicKey) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching current user's public key...");
        const res = await fetch("/api/account/user/publicKey");

        if (!res.ok) {
          throw new Error(`Failed to fetch public key: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Public key API response:", data);

        if (data.publicKey) {
          setPublicKey(data.publicKey);
          console.log("Current user public key set:", data.publicKey);
        } else {
          console.warn("No public key found in response:", data);
          setError("No public key found in response");
        }
      } catch (err) {
        console.error("Error fetching public key:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch public key");
      } finally {
        setIsLoading(false);
      }
    }

    if (pathname.startsWith("/messenger")) {
      fetchKey();
    }
  }, [pathname, publicKey]);

  const contextValue = {
    publicKey,
    setPublicKey: (key: string) => {
      setPublicKey(key);
      setError(null);
    },
    isLoading,
    error,
  };

  return (
    <PublicKeyContext.Provider value={contextValue}>
      {children}
    </PublicKeyContext.Provider>
  );
};

export const usePublicKey = () => {
  const context = useContext(PublicKeyContext);
  if (!context) throw new Error("usePublicKey must be used within a PublicKeyProvider");
  return context;
};
