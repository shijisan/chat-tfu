import { useRef, useState, useEffect } from "react";
import { FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

export default function AddReactionModal({ msg, userId, onTriggerFetch }) {
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(false);
  const buttonRef = useRef(null);

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

  return (
    <div className="relative inline-flex justify-center items-center">
      <button
        ref={buttonRef}
        className={`btn p-1 text-inherit hover:brightness-105 transition-all ${
          msg.senderId === userId ? "bg-blue-500 me-1" : "bg-neutral-200 ms-1"
        }`}
        onClick={() => setActiveEmojiPicker(!activeEmojiPicker)}
      >
        <FaRegSmile />
      </button>

      {activeEmojiPicker && (
        <div
          className={`absolute top-0 z-50 mt-2 ${
            msg.senderId === userId ? "left-auto right-8" : "left-8"
          }`}
        >
          <EmojiPicker
            emojiStyle="google"
            lazyLoadEmojis={false}
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
