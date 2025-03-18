"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Logout() {
    const router = useRouter();
    const [error, setError] = useState("");

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "An error occurred");
                return;
            }

            router.push("/auth/login");
        } catch (err) {
            console.error("Network error:", err);
            setError("A network error occurred. Please try again.");
        }
    };

    return (
        <>
            <button
                className="btn bg-red-500"
                onClick={handleLogout}
            >
                Log Out
            </button>
        </>
    );
}