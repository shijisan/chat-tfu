"use client";

import { FaBars } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
    const router = useRouter();
    const pathname = usePathname();

    if (pathname.startsWith("/contacts")) return null;

    return (
        <>
            <nav className="w-full top-0 left-0 z-50 fixed text-foreground px-4 backdrop-blur-xl bg-transparent bg-opacity-80">
                <div className="h-[8vh] w-full flex flex-row max-w-7xl mx-auto items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center md:w-1/2 w-full">
                        <h1 className="md:text-4xl text-3xl font-semibold poppins">
                            <span className="me-2 text-blue-500">🗣</span>
                            Chat-TFU
                        </h1>
                    </div>

                    {/* Hamburger Menu Button (Visible only on mobile) */}
                    <input type="checkbox" id="menu-toggle" className="hidden peer" />
                    <label
                        htmlFor="menu-toggle"
                        className="lg:hidden text-2xl cursor-pointer text-black"
                    >
                        <FaBars />
                    </label>

                    {/* Navigation Links */}
                    <ul className="lg:flex hidden peer-checked:flex flex-col lg:flex-row font-medium items-center fixed lg:static md:w-1/2 top-[8vh] left-0 w-full bg-background bg-opacity-50 lg:bg-transparent h-[92vh] lg:h-auto justify-evenly text-black lg:text-inherit text-center">
                        <li>
                            <a
                                className="p-2 hover:brightness-95"
                                href="/"
                                onClick={() => document.getElementById("menu-toggle")?.click()}
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                className="p-2 hover:brightness-95"
                                href="/contacts"
                                onClick={() => document.getElementById("menu-toggle")?.click()}
                            >
                                Messenger
                            </a>
                        </li>
                        <li>
                            <a
                                className="p-2 hover:brightness-95"
                                href="/meet"
                                onClick={() => document.getElementById("menu-toggle")?.click()}
                            >
                                Video Meet
                            </a>
                        </li>
                        <li>
                            <a
                                className="p-2 hover:brightness-95"
                                href="/account"
                                onClick={() => document.getElementById("menu-toggle")?.click()}
                            >
                                Account
                            </a>
                        </li>
                        <li className="gap-4 inline-flex">
                            <button
                                className="text-base btn text-foreground"
                                onClick={() => {
                                    document.getElementById("menu-toggle")?.click();
                                    router.push("/auth/login");
                                }}
                            >
                                Login
                            </button>
                            <button
                                className="text-base btn bg-blue-500 rounded-full"
                                onClick={() => {
                                    document.getElementById("menu-toggle")?.click();
                                    router.push("/auth/register");
                                }}
                            >
                                Sign Up
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}