"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrivateKeyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [passwordExists, setPasswordExists] = useState<boolean | null>(null);

  // fetch passwordExists once
  useEffect(() => {
    const fetchPasswordExists = async () => {
      try {
        const res = await fetch("/api/account/set-password");
        const data = await res.json();
        console.log("password exists?", data);
        setPasswordExists(data.passwordExists ?? false);
      } catch (err) {
        console.error("Failed to fetch user password status", err);
        setPasswordExists(false);
      }
    };
    fetchPasswordExists();
  }, []);

  // run redirect check only after we have passwordExists
  useEffect(() => {
    if (passwordExists === false){
      router.push("/account/set-password");
    }
    
  }, []);

  return <>{children}</>;
}
