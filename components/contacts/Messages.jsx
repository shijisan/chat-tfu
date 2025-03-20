"use client";

import { useState, useEffect, useRef } from "react";

export default function Messages({ contactId, contactName }) {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [triggerFetch, setTriggerFetch] = useState(false);
	const [userId, setUserId] = useState("");
	const messagesEndRef = useRef(null);
	const formRef = useRef(null);

	useEffect(() => {
		if (!contactId) return;

		const fetchUser = async () => {
			try {
				const res = await fetch("/api/getUser");
				if (!res.ok) throw new Error("Failed to fetch user");
				const data = await res.json();
				console.log("userId: ", data);
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
	
		const message = input; 
		setInput(""); 
	
		try {
			const res = await fetch(`/api/messages/${contactId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: message }),
			});
	
			if (!res.ok) throw new Error("Failed to send message");
	
			setTriggerFetch((prev) => !prev);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};
	

	return (
		<>
			<div className="flex-grow min-h-[85vh] overflow-y-auto p-4">
				<div className="w-full h-[5vh] border-b p-2 font-bold">{contactName}</div>
				<div className="flex flex-col gap-2 mt-2">
					{messages.map((msg, index) => {
						const isSentByUser = msg.senderId === userId;
						return (
							<div
								key={index}
								className={`max-w-[70%] p-2 rounded-md ${
									isSentByUser
										? "bg-blue-500 text-white self-end text-end"
										: "bg-gray-200 text-black self-start text-start"
								}`}
							>
								{msg.content}
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
