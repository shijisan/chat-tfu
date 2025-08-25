"use client";

import { PrivateKeyProvider } from "@/context/PrivateKeyContext";
import PrivateKeyGuard from "./PrivateKeyGuard";
import { SessionProvider } from "next-auth/react";
import { PublicKeyProvider } from "@/context/PublicKeyContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PublicKeyProvider>
        <PrivateKeyProvider>
          <PrivateKeyGuard>{children}</PrivateKeyGuard>
        </PrivateKeyProvider>
      </PublicKeyProvider>
    </SessionProvider>
  );
}
