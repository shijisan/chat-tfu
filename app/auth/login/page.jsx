"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const email = useRef(null);
    const password = useRef(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault(); 

        setError("");

        if (!email.current?.value || !password.current?.value) {
            setError("Please fill in all required fields");
            return; 
        }

        const formData = {
            email: email.current.value,
            password: password.current.value,
        };

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "An error occurred");
                return;
            }

            const data = await res.json();
            console.log("Login successful:", data);

            router.push("/account");
        } catch (err) {
            console.error("Network error:", err);
            setError("A network error occurred. Please try again.");
        }
    };

    return (
        <>
            <main className="md:px-[10vw] mx-auto flex w-full justify-center items-center min-h-screen bg-blue-400">
                <form
                    className="card card-sm"
                    onSubmit={handleLogin} 
                >
                    <div>
                        <h1 className="text-center text-xl font-medium">
                            Sign In To Your Account
                        </h1>
                    </div>
                    <div>
                        <label hidden htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            ref={email}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div>
                        <label hidden htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            ref={password}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <button type="submit">Login</button> 
                    </div>
                    <div className="mb-0">
                        <p className="text-center">
                            Don't have an account?{" "}
                            <a
                                className="text-blue-500 hover:underline"
                                href="/auth/register"
                            >
                                Sign Up
                            </a>
                        </p>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
            </main>
        </>
    );
}