"use client";
import { useState, useEffect, useRef } from "react";
import { FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react"; // Import the emoji picker

export default function Messages({ contactId, contactName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [userId, setUserId] = useState("");
    const [showOptions, setShowOptions] = useState(null); // Controls visibility of options menu
    const [editMessage, setEditMessage] = useState(null); // Controls visibility of edit input
    const [editInput, setEditInput] = useState(""); // Stores the current edit input value
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(null); // Tracks which message's emoji picker is active
    const messagesEndRef = useRef(null);
    const formRef = useRef(null);

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
        if (!userId || !contactId) return;
        const eventSource = new EventSource(`/api/messages/${contactId}/stream`);
        eventSource.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, newMessage]);
        };
        return () => eventSource.close();
    }, [contactId, userId]);

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

    const toggleOptions = (index) => {
        setShowOptions((prev) => (prev === index ? null : index));
        if (showOptions !== index) {
            setEditMessage(null); // Close edit mode if toggling options for a different message
        }
    };

    const handleEdit = (id, content) => {
        setEditMessage(id); // Enable edit mode for this message
        setEditInput(content); // Pre-fill the edit input with the current message content
        setShowOptions(null); // Hide the options menu
    };

    const saveEdit = async (id) => {
        try {
            await fetch(`/api/messages/${contactId}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editInput }),
            });
            setEditMessage(null); // Exit edit mode
            setTriggerFetch((prev) => !prev); // Trigger a re-fetch of messages
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const cancelEdit = () => {
        setEditMessage(null); // Exit edit mode
        setEditInput(""); // Clear the edit input
    };

    const deleteMessage = async (id) => {
        try {
            await fetch(`/api/messages/${contactId}/${id}`, {
                method: "DELETE",
            });
            setTriggerFetch((prev) => !prev); // Trigger a re-fetch of messages
        } catch (error) {
            console.error("Error deleting message:", error);
        }
        setShowOptions(null); // Hide the options menu
    };

    const addReaction = async (messageId, emoji) => {
        try {
            if (!emoji?.trim()) {
                console.error("Invalid emoji:", emoji);
                return;
            }
            console.log("Adding reaction with emoji:", emoji); // Log the emoji being sent
            const response = await fetch(`/api/messages/${contactId}/${messageId}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, emoji }),
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to add reaction");
            }
            // Trigger a re-fetch of messages to update reactions
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    };

    return (
        <>
            <div className="flex-grow min-h-[85vh] overflow-y-auto">
                <div className="w-full h-[5vh] border-b px-8 font-bold flex items-center">{contactName}</div>
                {messages.map((msg, index) => {
                    const isSentByUser = msg.senderId === userId;
                    return (
                        <>
                            <div className="flex flex-col mt-2 p-8">
                                <div
                                    key={msg.id}
                                    className={`max-w-[70%] p-2 rounded-md flex flex-row transition-all relative group ${isSentByUser
                                        ? "bg-blue-500 text-white self-end text-end me-8"
                                        : "bg-gray-200 text-black self-start text-start"
                                        }`}
                                >
                                    {/* React Button */}
                                    {isSentByUser && (
                                        <div className="relative">
                                            <button
                                                className="btn py-0 px-1 relative text-neutral-300"
                                                onClick={() =>
                                                    setActiveEmojiPicker(activeEmojiPicker === index ? null : index)
                                                }
                                            >
                                                <FaRegSmile />
                                            </button>
                                            {/* Emoji Picker */}
                                            {activeEmojiPicker === index && (
                                                <div className="absolute top-full right-0 z-10">
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData, event) => {
                                                            console.log("Selected emoji data:", emojiData); // Debugging log
                                                            const emoji = emojiData?.emoji; // Extract the emoji string
                                                            console.log("Extracted emoji:", emoji); // Debugging log
                                                            if (emoji) {
                                                                addReaction(msg.id, emoji); // Add or replace the reaction
                                                                setActiveEmojiPicker(null); // Hide the emoji picker
                                                            } else {
                                                                console.error("Failed to extract emoji from emojiData:", emojiData);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Options Button */}
                                    {isSentByUser && (
                                        <button
                                            className={`btn py-0 ps-1 pe-3 ${showOptions === index ? "block" : "hidden group-hover:block"
                                                }`}
                                            onClick={() => toggleOptions(index)}
                                        >
                                            &bull;&bull;&bull;
                                        </button>
                                    )}
                                    {/* Message Content */}
                                    {editMessage !== msg.id && <p>{msg.content}</p>}
                                    {/* Edit Input */}
                                    {editMessage === msg.id && (
                                        <div>
                                            <input
                                                className="bg-white text-foreground py-1 px-2"
                                                value={editInput}
                                                onChange={(e) => setEditInput(e.target.value)}
                                            />
                                            <button className="btn" onClick={() => saveEdit(msg.id)}>Save</button>
                                            <button className="btn" onClick={cancelEdit}>Cancel</button>
                                        </div>
                                    )}
                                    {/* Options Menu */}
                                    {showOptions === index && (
                                        <div className="bg-white border rounded shadow absolute -ms-36 -mt-2 border-neutral-300">
                                            <button
                                                className="btn text-green-500"
                                                onClick={() => handleEdit(msg.id, msg.content)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn text-red-500"
                                                onClick={() => deleteMessage(msg.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                </div>

                                {/* Display Reactions */}
                                {msg.reacts?.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {msg.reacts.map((reaction, idx) => (
                                            <span key={idx} className="text-sm text-neutral-500 relative">
                                                {reaction.emoji}
                                                {/* Show a remove button if the reaction belongs to the current user */}
                                                {reaction.userId === userId && (
                                                    <button
                                                        className="absolute top-0 right-0 text-red-500"
                                                        onClick={() => removeReaction(msg.id)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-4 pb-8 px-4" ref={formRef}>
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