"use client";

import { useState, useEffect, useRef } from "react";
import MessageItem from "./MessageItem.jsx"; // Import the MessageItem component

export default function Messages({ contactId, contactName }) {
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
    }, [contactId, triggerFetch]);

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
        <>
            <div className="flex-grow min-h-[88vh] overflow-y-auto">
                <div className="w-full h-[5vh] border-b border-neutral-300 px-8 font-bold flex items-center">
                    {contactName}
                </div>
                <div className="p-4">
                    {messages.map((msg, index) => (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            userId={userId}
                            onTriggerFetch={() => setTriggerFetch((prev) => !prev)}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 pb-8 px-4">
                <input
                    className="flex-grow w-full bg-neutral-200 rounded-s-full py-2 px-4"
                    type="text"
                    placeholder="Start a chat..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="py-2 px-4 btn bg-blue-500 rounded-e-full" type="submit">
                    Send
                </button>
            </form>
        </>
    );
}