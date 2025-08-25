"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { usePrivateKey } from "@/context/PrivateKeyContext";
import MessengerSideBar from "@/components/MessengerSidebar";
import { derivePrivateKey } from "@/lib/cryptoUtils";
import { decryptMessage } from "@/lib/messageCryptoUtils";
import type { User } from "./page";
import Messenger from "./page";
import ConvoInfoSidebar from "@/components/ConvoInfoSidebar";
import Toolbar from "@/components/Toolbar";
import Link from "next/link";
import MessengerConvoNav from "@/components/MessengerConvoNav";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardHeader, CardContent, CardAction, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserAuth = {
	id: string;
	publicKey: string;
	encryptedPrivateKey: string;
	salt: string;
	iv: string;
};

type Message = {
	id: string;
	senderId?: string;
	sender?: { id: string; name: string; image?: string };
	senderCipherText?: string;
	recipientCipherText?: string;
	createdAt?: string;
};

type Conversation = {
	id: string;
	createdAt: string;
	Message: Message[];
	conversationMember: {
		user: User;
	}[];
};

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
	const { status } = useSession();
	const { privateKey, updatePrivateKey } = usePrivateKey();
	const pathname = usePathname();

	const [unlockForm, setUnlockForm] = useState(false);
	const [EPassword, setEPassword] = useState("");
	const [userAuth, setUserAuth] = useState<UserAuth | undefined>();
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [conversation, setConversation] = useState<Conversation[] | null>(null);
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
	const [recipientEmail, setRecipientEmail] = useState("");
	const [messageContent, setMessageContent] = useState("");
	const [isMainMessengerPage, setIsMainMessengerPage] = useState(false);
	const [unlockError, setUnlockError] = useState<string | null>(null);

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!userAuth) return;
		try {
			const derivedPrivateKey = await derivePrivateKey(
				EPassword,
				userAuth.encryptedPrivateKey,
				userAuth.iv,
				userAuth.salt
			);
			updatePrivateKey(derivedPrivateKey);
			setUnlockForm(false);
			setUnlockError(null);
		} catch (err) {
			if (err instanceof Error && err.message === "Invalid password") {
				setUnlockError("Wrong password. Please try again.");
			} else {
				setUnlockError("Failed to unlock messages.");
			}
		}
	};


	const fetchCurrentUser = async () => {
		try {
			const res = await fetch("/api/account/userAuth");
			const data = await res.json();
			setUserAuth(data.userAuth);

			const userRes = await fetch("/api/account/user");
			const userData = await userRes.json();
			setCurrentUserId(userData.user?.id || "");
		} catch {
			setUnlockError("Failed to fetch user details.");
		}
	};

	const fetchConversations = useCallback(async () => {
		try {
			const res = await fetch("/api/messenger/conversations");
			const data = await res.json();
			const convs: Conversation[] = Array.isArray(data?.conversations)
				? data.conversations
				: data?.conversations
					? [data.conversations]
					: [];
			setConversation(convs.length ? convs : null);

			if (convs.length && privateKey && currentUserId) {
				const map: Record<string, string> = {};
				await Promise.all(
					convs.map(async (convo) => {
						const latest = convo.Message?.[0];
						if (!latest) return (map[convo.id] = "(No latest message)");
						const isSender = latest.senderId === currentUserId;
						const ciphertext = isSender ? latest.senderCipherText : latest.recipientCipherText;
						if (!ciphertext) return (map[convo.id] = "(No message content)");
						try {
							map[convo.id] = (await decryptMessage(ciphertext, privateKey)) || "(Empty message)";
						} catch {
							map[convo.id] = "(Failed to decrypt)";
						}
					})
				);
				setDecryptedMessages(map);
				setIsDecrypting(false);
			}
		} catch {
			setUnlockError("Failed to fetch conversations.");
		}
	}, [setConversation, setDecryptedMessages, setIsDecrypting, currentUserId, privateKey]);

	useEffect(() => {
		setIsMainMessengerPage(pathname === "/messenger");
	}, [pathname]);

	useEffect(() => {
		if (status === "authenticated" && !privateKey && !userAuth) {
			fetchCurrentUser().then(() => setUnlockForm(true));
		}
	}, [status, privateKey, userAuth]);

	useEffect(() => {
		if (status === "authenticated" && privateKey && currentUserId) {
			fetchConversations();
		}
	}, [status, privateKey, currentUserId, fetchConversations]);

	if (unlockForm && !privateKey) {
		return (
			<div className="min-h-screen w-full justify-center items-center flex">
				<Card className="max-w-sm h-full w-full">
					<CardHeader>
						<CardTitle>Unlock Your Messages</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleFormSubmit} className="flex gap-2 flex-col">
							<Input
								type="password"
								value={EPassword}
								onChange={(e) => setEPassword(e.target.value)}
								placeholder="Enter encryption password"
								required
							/>
							{unlockError && <p className="text-sm text-red-500">{unlockError}</p>}
							<CardAction>
								<Button type="submit">Unlock</Button>
							</CardAction>
						</form>
					</CardContent>
					<CardFooter>
						<CardAction>
							<Button variant="link" asChild>
								<Link className="text-xs" href="/">Back home</Link>
							</Button>
						</CardAction>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<div className="flex w-full h-screen relative">
				<Toolbar />
				<MessengerSideBar
					fetchCurrentUser={fetchCurrentUser}
					fetchConversations={fetchConversations}
					conversation={conversation}
					isDecrypting={isDecrypting}
					currentUserId={currentUserId}
					decryptedMessages={decryptedMessages}
				/>
				<main className="flex-1 overflow-auto flex flex-col">
					<MessengerConvoNav />
					{isMainMessengerPage ? (
						<Messenger
							userAuth={userAuth}
							conversation={conversation}
							fetchConversations={fetchConversations}
							recipientEmail={recipientEmail}
							setRecipientEmail={setRecipientEmail}
							messageContent={messageContent}
							setMessageContent={setMessageContent}
						/>
					) : (
						children
					)}
				</main>
				<ConvoInfoSidebar
					fetchCurrentUser={fetchCurrentUser}
					fetchConversations={fetchConversations}
					conversation={conversation}
					isDecrypting={isDecrypting}
					currentUserId={currentUserId}
					decryptedMessages={decryptedMessages}
				/>
			</div>
		</SidebarProvider>
	);
}
