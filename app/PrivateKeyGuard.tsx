"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PrivateKeyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [passwordExists, setPasswordExists] = useState<boolean | null>(null);
  const pathname = usePathname();

  const fetchPasswordExists = useCallback(async () => {
    try {
      // Check if account has a password
      const res = await fetch("/api/account/set-password");
      const data = await res.json();
      setPasswordExists(data.passwordExists);

      if (data.passwordExists === false ) {
        router.replace("/account/set-password");
        return;
      }

      // Check if session user exists in DB
      const userRes = await fetch("/api/account/user");
      if (!userRes.ok) {
        console.error("User not found or session invalid, redirecting to /auth");
        router.replace("/auth");
        return;
      }

      const userData = await userRes.json();
      if (!userData.user) {
        console.error("User data missing, redirecting to /auth");
        router.replace("/auth");
        return;
      }

      console.log("User verified:", userData.user.id);
    } catch (err) {
      console.error("Error verifying password or user:", err);
      router.replace("/auth");
    }
  }, [router]);

  useEffect(() => {
    if (
      pathname !== "/" &&
      pathname !== "/account/set-password" &&
      pathname !== "/auth"
    ) {
      fetchPasswordExists();
    }
  }, [fetchPasswordExists, pathname]);

  // Your existing messenger shortcut logic
  if (pathname === "/messenger" && passwordExists) {
    return;
  }

  return <>{children}</>;
}
