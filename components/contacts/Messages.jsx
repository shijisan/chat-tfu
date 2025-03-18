"use client";
import { useEffect, useState, useRef } from "react";

export default function Messages({ contactId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [triggerFetch, setTriggerFetch] = useState(false);
  const formRef = useRef(null);

  // Fetch messages initially and on new message send
  useEffect(() => {
    if (!contactId) return;

    fetch(`/api/messages/${contactId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

    const eventSource = new EventSource(`/api/messages/${contactId}/stream`);
    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };

    return () => eventSource.close();
  }, [contactId, triggerFetch]); // Re-fetch when triggerFetch changes

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/messages/${contactId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    setInput("");
    setTriggerFetch((prev) => !prev); // Toggle triggerFetch to force a re-fetch
  };

  return (
    <>
      <div className="flex-grow min-h-[85vh] overflow-y-auto">
        <div className="w-full h-[5vh] border-b">
            <p>{contactId}</p>
        </div>
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-neutral-100 rounded-md my-1">
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-4">
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
