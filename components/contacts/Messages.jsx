"use client";
import { useState, useEffect, useRef } from "react";
import { FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

export default function Messages({ contactId, contactName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [userId, setUserId] = useState("");
    const [showOptions, setShowOptions] = useState(null);
    const [editMessage, setEditMessage] = useState(null);
    const [editInput, setEditInput] = useState("");
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
    const [expandedReaction, setExpandedReaction] = useState(null); // Track expanded reaction
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
            setEditMessage(null);
        }
    };

    const handleEdit = (id, content) => {
        setEditMessage(id);
        setEditInput(content);
        setShowOptions(null);
    };

    const saveEdit = async (id) => {
        try {
            await fetch(`/api/messages/${contactId}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editInput }),
            });
            setEditMessage(null);
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const cancelEdit = () => {
        setEditMessage(null);
        setEditInput("");
    };

    const deleteMessage = async (id) => {
        try {
            await fetch(`/api/messages/${contactId}/${id}`, {
                method: "DELETE",
            });
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
        setShowOptions(null);
    };

    const addReaction = async (messageId, emoji) => {
        try {
            if (!emoji?.trim()) {
                console.error("Invalid emoji:", emoji);
                return;
            }
            console.log("Adding reaction with emoji:", emoji);
            const response = await fetch(`/api/messages/${contactId}/${messageId}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, emoji }),
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to add reaction");
            }
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    };

    const removeReaction = async (messageId) => {
        try {
            const response = await fetch(`/api/messages/${contactId}/${messageId}/react`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to remove reaction");
            }
            setTriggerFetch((prev) => !prev);
        } catch (error) {
            console.error("Error removing reaction:", error);
        }
    };

    return (
        <>
            <div className="flex-grow min-h-[85vh] overflow-y-auto">
                <div className="w-full h-[5vh] border-b px-8 font-bold flex items-center">{contactName}</div>
                <div className="">
                    {messages.map((msg, index) => {
                        const isSentByUser = msg.senderId === userId;

                        // Group reactions by emoji
                        const groupedReactions = {};
                        msg.reactions?.forEach((reaction) => {
                            if (!groupedReactions[reaction.emoji]) {
                                groupedReactions[reaction.emoji] = [];
                            }
                            groupedReactions[reaction.emoji].push(reaction);
                        });

                        return (
                            <div className="flex flex-col gap-2 p-8" key={msg.id}>
                                {/* Message Block */}
                                <div
                                    className={`max-w-[70%] p-2 rounded-md flex flex-row transition-all relative group ${isSentByUser
                                        ? "bg-blue-500 text-white self-end text-end"
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
                                                            console.log("Selected emoji data:", emojiData);
                                                            const emoji = emojiData?.emoji;
                                                            console.log("Extracted emoji:", emoji);
                                                            if (emoji) {
                                                                addReaction(msg.id, emoji);
                                                                setActiveEmojiPicker(null);
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

                                {/* Display Reactions Below the Message */}
                                {Object.keys(groupedReactions).length > 0 && (
                                    <div className={`flex gap-1 ${isSentByUser ? "self-end" : "self-start"}`}>
                                        {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                                            // Sort reactions: current user's reaction first
                                            const sortedReactions = reactions.sort((a) =>
                                                a.userId === userId ? -1 : 0
                                            );

                                            // Check if this reaction is expanded
                                            const isExpanded = expandedReaction === `${msg.id}-${emoji}`;

                                            return (
                                                <div
                                                    key={emoji}
                                                    className="relative cursor-pointer"
                                                    onClick={() =>
                                                        setExpandedReaction(isExpanded ? null : `${msg.id}-${emoji}`)
                                                    }
                                                >
                                                    {/* Emoji and count */}
                                                    <span className="text-sm text-neutral-500">
                                                        {emoji} ({reactions.length})
                                                    </span>

                                                    {/* Expanded Reaction Details */}
                                                    {isExpanded && (
                                                        <div className="absolute top-full right-full mt-1 bg-white border rounded shadow w-48 z-10">
                                                            {sortedReactions.map((reaction, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex justify-between items-center px-2 py-1 hover:bg-gray-100"
                                                                >
                                                                    <span><span className="me-1">{reaction.emoji}</span>{reaction.user?.username || "Unknown User"}</span>
                                                                    {reaction.userId === userId && (
                                                                        <button
                                                                            className="text-red-500"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Prevent collapsing the reaction
                                                                                removeReaction(msg.id);
                                                                            }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
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