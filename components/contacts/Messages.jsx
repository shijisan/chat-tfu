"use client";

import { useState, useEffect, useRef } from "react";
import MessageItem from "./MessageItem.jsx";

export default function Messages({ contactId, contactName, onMobileToggle }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [userId, setUserId] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!contactId) return;

        const fetchUser = async () => {
            try {
                const res = await fetch("/api/getUser");
                if (!res.ok) throw new Error("Failed to fetch user");
                const data = await res.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Error fetching user", error);
            }
        };

        fetchUser();
    }, [contactId]);

    useEffect(() => {
        if (!contactId) return;

        const interval = setInterval(() => {
            const fetchMessages = async () => {
                try {
                    const res = await fetch(`/api/messages/${contactId}`);
                    if (!res.ok) throw new Error("Failed to fetch messages");
                    const data = await res.json();
                    setMessages(data);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };

            fetchMessages();
        }, 5000); // every 3 seconds

        return () => clearInterval(interval);
    }, [contactId]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            await fetch(`/api/messages/${contactId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: input }),
            });
            setInput("");
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="size-full rounded-3xl bg-white border border-neutral-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-300">
                <button
                    className="md:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    onClick={() => onMobileToggle(true)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="font-bold text-lg truncate flex-1 md:text-left text-center">
                    {contactName}
                </h2>
                <div className="w-10 md:hidden" /> {/* Spacer for mobile centering */}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {messages.map((msg) => (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            userId={userId}
                            onTriggerFetch={() => setTriggerFetch((prev) => !prev)}
                        />
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-neutral-300">
                <input
                    className="flex-1 bg-neutral-200 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    className="py-3 px-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium" 
                    type="submit"
                    disabled={!input.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}