"use client"
import Link from "next/link"

export default function ContactNav() {
    return (
        <>
            <nav className="w-full h-[5vh] fixed bottom-0 left-0 bg-blue-500 z-50">
                <ul className="flex justify-evenly items-center h-full text-white">
                    <li>
                        <Link href="/">
                            <h1 className="md:text-2xl font-semibold poppins">
                                <span className="me-2 text-white-500">🗣</span>
                                Chat-TFU
                            </h1>
                        </Link>
                    </li>
                    <li><Link href="/contacts">Chats</Link></li>
                    <li><Link href="/meet">Video Meet</Link></li>
                    <li><Link href="/account">Account</Link></li>
                    <li><Link href="/">Home</Link></li>
                </ul>
            </nav>
        </>
    )
}