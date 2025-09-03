"use client";

import { encryptMessage } from "@/lib/messageCryptoUtils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrivateKey } from "@/context/PrivateKeyContext";
import { signMessage } from "@/lib/messageCryptoUtils";

type MessengerProps = {
	userAuth: UserAuth | undefined;
	conversation: Conversation[] | null;
	fetchConversations: () => Promise<void>;
	recipientEmail: string;
	setRecipientEmail: (email: string) => void;
	messageContent: string;
	setMessageContent: (content: string) => void;
};

export type User = {
	id: string;
	name: string;
	image: string;
};

export type UserAuth = {
	id: string;
	publicKey: string;
	encryptedPrivateKey: string;
	salt: string;
	iv: string;
};

export type Message = {
	id: string;
	content?: string;
	senderId?: string;
	sender?: {
		id: string;
		name: string;
		image?: string;
	};
	senderCipherText?: string;
	recipientCipherText?: string;
	createdAt?: string;
};

export type Conversation = {
	id: string;
	createdAt: string;
	user?: User;
	Message: Message[];
};

export default function Messenger({
	userAuth,
	conversation,
	fetchConversations,
	recipientEmail,
	setRecipientEmail,
	messageContent,
	setMessageContent,
}: MessengerProps) {

	const {privateKey} = usePrivateKey();

	const handleMessageSend = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const recipientRes = await fetch("/api/messenger/recipient", {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					recipientEmail,
				}),
			});

			const recipientData = await recipientRes.json();

			if (recipientData && recipientData.recipientInfo && recipientData.recipientInfo.userAuth) {
				const senderPublicKey = userAuth?.publicKey;
				const recipientPublicKey = recipientData.recipientInfo.userAuth.publicKey;

				if (!senderPublicKey || !recipientPublicKey) {
					console.error("Missing public keys");
					return;
				}

				const fetchSenderCipherText = await encryptMessage(messageContent, senderPublicKey);
				const fetchRecipientCipherText = await encryptMessage(messageContent, recipientPublicKey);

				let conversationId = null;
				if (conversation && conversation[0]?.id) {
					conversationId = conversation[0].id;
				}

				if (!fetchRecipientCipherText || ! fetchSenderCipherText || !privateKey) {
					console.error("Missing ciphertexts/privateKey");
					return;
				}

				const senderCipherText = fetchSenderCipherText.ciphertext;
				const recipientCipherText = fetchRecipientCipherText.ciphertext;

				const messageSignature = await signMessage(senderCipherText, recipientCipherText, privateKey)

				const messageRes = await fetch("/api/messenger/message", {
					method: "POST",
					headers: {
						"Content-type": "application/json",
					},
					body: JSON.stringify({
						recipientEmail,
						senderCipherText,
						recipientCipherText,
						conversationId,
						messageSignature
					}),
				});

				const messageData = await messageRes.json();

				if (messageRes.ok) {
					setMessageContent("");
					setRecipientEmail("");
					await fetchConversations();
				} else {
					console.error("Message API failed:", messageData);
				}
			} else {
				console.error("Recipient not found or invalid recipient data");
			}
		} catch (err) {
			console.error("Failed to send message:", err);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen w-full">
			<Card className="max-w-md w-full">
				<CardHeader>
					<CardTitle>Start a Conversation</CardTitle>
				</CardHeader>

				<CardContent>
					<form className="flex flex-col gap-4" onSubmit={handleMessageSend}>
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">Contact&apos;s Email</label>
							<Input
								type="email"
								value={recipientEmail}
								onChange={(e) => setRecipientEmail(e.target.value)}
								placeholder="ben-dover@example.com"
								autoComplete="off"
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">Message</label>
							<Textarea
								value={messageContent}
								onChange={(e) => setMessageContent(e.target.value)}
								name="message"
								placeholder="Say something..."
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							Send Message
						</Button>
					</form>
				</CardContent>

		</Card>
    </div >
  );
}
