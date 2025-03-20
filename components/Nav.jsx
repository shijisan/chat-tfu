"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
    const router = useRouter();
    const pathname = usePathname();

    if (pathname.startsWith("/contacts")) return null;

    return (
        <nav className="bg-transparent backdrop-blur-xs text-foreground w-full h-[8vh] flex items-center md:px-[10vw] fixed top-0 left-0">
            <div className="md:w-1/2 w-full">
                <h1 className="md:text-4xl poppins">
                    <span className="me-2 text-blue-500">🗣</span>
                    Chat-TFU
                </h1>
            </div>
            <ul className="flex md:flex-row flex-col justify-evenly w-full md:h-auto h-screen md:static fixed top-0 left-0 md:w-1/2 items-center">
                <li className="h-full">
                    <a className="p-2 hover:brightness-95" href="/">Home</a>
                </li>
                <li className="h-full">
                    <a className="p-2 hover:brightness-95" href="/contacts">Messenger</a>
                </li>
                <li className="h-full">
                    <a className="p-2 hover:brightness-95" href="/meet">Video Meet</a>
                </li>
                <li className="h-full">
                    <a className="p-2 hover:brightness-95" href="/account">Account</a>
                </li>

                <li className="h-full gap-4 inline-flex">
                    <button className="text-base btn text-foreground" onClick={() => router.push("/auth/login")}>Login</button>
                    <button className="text-base btn bg-blue-500 rounded-full" onClick={() => router.push("/auth/register")}>Sign Up</button>
                </li>
            </ul>
        </nav>
    );
}
