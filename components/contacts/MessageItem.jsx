"use client";

import { useState } from "react";
import AddReactionModal from "./AddReactionModal"; // Import the AddReactionModal component
import { FaTrashAlt } from "react-icons/fa";

export default function MessageItem({ msg, userId, onTriggerFetch }) {
    const [showOptions, setShowOptions] = useState(null);
    const [editMessage, setEditMessage] = useState(null);
    const [editInput, setEditInput] = useState("");
    const [expandedReaction, setExpandedReaction] = useState(null); // Track expanded reaction

    const toggleOptions = () => setShowOptions((prev) => !prev);

    const handleEdit = (content) => {
        setEditMessage(msg.id);
        setEditInput(content);
        setShowOptions(false);
    };

    const saveEdit = async () => {
        try {
            await fetch(`/api/messages/${msg.contactId}/${msg.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editInput }),
            });
            setEditMessage(null);
            onTriggerFetch();
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const cancelEdit = () => {
        setEditMessage(null);
        setEditInput("");
    };

    const deleteMessage = async () => {
        try {
            await fetch(`/api/messages/${msg.contactId}/${msg.id}`, {
                method: "DELETE",
            });
            onTriggerFetch();
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const removeReaction = async (reactionId) => {
        try {
            await fetch(`/api/messages/${msg.contactId}/${msg.id}/react`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reactionId }),
            });
            onTriggerFetch();
        } catch (error) {
            console.error("Error removing reaction:", error);
        }
    };

    const toggleExpandedReaction = (emoji) => {
        setExpandedReaction((prev) => (prev === emoji ? null : emoji));
    };

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
                className={`max-w-[70%] p-2 rounded-md flex transition-all relative group ${
                    isSentByUser
                        ? "bg-blue-500 text-white self-end text-end flex-row"
                        : "bg-gray-200 text-black self-start text-start flex-row-reverse"
                }`}
            >
                {/* React Button */}
                <AddReactionModal msg={msg} userId={userId} onTriggerFetch={onTriggerFetch} />

                {/* Options Button */}
                {isSentByUser && (
                    <button
                        className={`btn py-0 ps-1 pe-3 ${showOptions ? "block" : "hidden group-hover:block "}`}
                        onClick={toggleOptions}
                        onTouchStart={(e) => {
                            e.stopPropagation(); // Prevent collapsing
                            toggleOptions();
                        }}
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
                        <button className="btn" onClick={saveEdit}>
                            Save
                        </button>
                        <button className="btn" onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                )}

                {/* Options Menu */}
                {showOptions && (
                    <div className="bg-white border rounded shadow absolute -ms-36 -mt-2 border-neutral-300">
                        <button className="btn text-green-500" onClick={() => handleEdit(msg.content)}>
                            Edit
                        </button>
                        <button className="btn text-red-500" onClick={deleteMessage}>
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Display Reactions Below the Message */}
            {Object.keys(groupedReactions).length > 0 && (
                <div className={`flex gap-1 ${isSentByUser ? "self-end" : "self-start"}`}>
                    {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                        const isExpanded = expandedReaction === emoji;
                        return (
                            <span key={emoji} className="text-sm text-neutral-500 relative cursor-pointer">
                                {/* Emoji and Count */}
                                <span onClick={() => toggleExpandedReaction(emoji)}>
                                    <span className="emoji">{emoji}</span> ({reactions.length})
                                </span>

                                {/* Expanded Reaction Details */}
                                {isExpanded && (
                                    <div className={`absolute top-full mt-1 bg-white border rounded shadow w-48 z-10 ${isSentByUser ? "right-full" : "left-full"}`}>
                                        {reactions.map((reaction, idx) => (
                                            <div
                                                key={idx}
                                                className="flex justify-between items-center px-2 py-1 hover:bg-gray-100"
                                            >
                                                <span className="emoji">{reaction.emoji}</span>
                                                <span>{reaction.user?.username || "Unknown User"}</span>
                                                {reaction.userId === userId && (
                                                    <button
                                                        className="text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent collapsing
                                                            removeReaction(reaction.id);
                                                        }}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}