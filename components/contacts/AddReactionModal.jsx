"use client";

import { useState } from "react";
import { FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

export default function AddReactionModal({ msg, userId, onTriggerFetch }) {
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(false);

    const addReaction = async (emoji) => {
        try {
            await fetch(`/api/messages/${msg.contactId}/${msg.id}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, emoji }),
            });
            onTriggerFetch();
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    };

    const isSentByUser = msg.senderId === userId;

    return (
        <div className="relative flex justify-center items-center">
            <button
                className={`btn p-1 relative text-inherit hover:brightness-105 transition-all ${
                    msg.senderId === userId ? "bg-blue-500 me-1" : "bg-neutral-200 ms-1"
                }`}
                onClick={() => setActiveEmojiPicker(!activeEmojiPicker)}
            >
                <FaRegSmile />
            </button>
            {activeEmojiPicker && (
                <div className={`absolute top-full right-0 z-10 ${isSentByUser ? "right-full" : "left-full"}`}>
                    <EmojiPicker
                    lazyLoadEmojis={true}
                    emojiStyle="google"
                        onEmojiClick={(emojiData) => {
                            addReaction(emojiData.emoji);
                            setActiveEmojiPicker(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}