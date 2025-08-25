"use client";

import type { User } from "@/app/messenger/page";
import { Sidebar } from "./ui/sidebar";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type ExtendedUser = User & {
	email: string,
}

type Message = {
	id: string;
	senderId?: string;
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


type Props = {
	fetchCurrentUser?: () => Promise<void>;
	fetchConversations?: () => Promise<void>;
	conversation: Conversation[] | null;
	isDecrypting?: boolean;
	currentUserId?: string;
	decryptedMessages?: Record<string, string>;
};

export default function ConvoInfoSidebar({
}: Props) {

	const { conversationId } = useParams();
	const [otherConvoMember, setOtherConvoMember] = useState<ExtendedUser>();

	const fetchOtherConvoMember = useCallback(async () => {
		try {
			const res = await fetch(`/api/messenger/conversations/${conversationId}/other-convo-member/`);
			const data = await res.json();
			setOtherConvoMember(data.otherConvoMember?.user);
		} catch (err) {
			console.error("Failed to fetch convo member", err);
		}
	}, [conversationId]);

	useEffect(() => {
		if (conversationId) {
			fetchOtherConvoMember();
		}
	}, [conversationId, fetchOtherConvoMember]);


	return (
		<Sidebar
			collapsible="none"
			className="overflow-hidden border-l md:flex hidden"
			side="right"
		>
			<div className="flex items-center justify-center flex-col pt-8">
				{otherConvoMember ? (
					<>
						<Image className="size-10 rounded-full" src={otherConvoMember.image} alt="qwe" height={40} width={40} />
						<p>{otherConvoMember.name}</p>
						<p className="text-sm">{otherConvoMember?.email}</p>
					</>
				) : (
					<>
						<p>No Convo Member</p>
					</>
				)}
			</div>
		</Sidebar>
	);
}
