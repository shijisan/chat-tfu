"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
    const username = useRef(null);
    const email = useRef(null);
    const password = useRef(null);
    const confirmPassword = useRef(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (password.current?.value !== confirmPassword.current?.value) {
            setError("Passwords don't match");
            return;
        }

        const formData = {
            username: username.current?.value,
            email: email.current?.value,
            password: password.current?.value,
        };

        try {
            const res = await fetch("/api/auth/register", {
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
            console.log("Registration successful:", data);

            router.push("/account");
        } catch (err) {
            console.error("Network error:", err);
            setError("A network error occurred. Please try again.");
        }
    };

    return (
        <>
            <main className="md:px-[10vw] mx-auto flex w-full justify-center items-center min-h-screen bg-blue-400">
                <form className="card card-sm">
                    <div>
                        <h1 className="text-center text-xl font-medium">Create an Account</h1>
                    </div>
                    <div>
                        <label hidden htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            ref={username}
                            placeholder="Username"
                        />
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
                        />
                    </div>
                    <div>
                        <label hidden htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            ref={confirmPassword}
                            placeholder="Confirm Password"
                        />
                    </div>
                    <div className="mt-4">
                        <button onClick={handleRegister}>Register</button>
                    </div>
                    <div className="mb-0">
                        <p className="text-center">
                            Already have an account?{" "}
                            <a
                                className="text-blue-500 hover:underline"
                                href="/auth/login"
                            >
                                Log In
                            </a>
                        </p>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
            </main>
        </>
    );
}