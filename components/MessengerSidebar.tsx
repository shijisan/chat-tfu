"use client";

import { useRouter, useParams } from "next/navigation";
import type { User } from "@/app/messenger/page";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	useSidebar,
} from "./ui/sidebar";
import Image from "next/image";
import { Mail, MessageCirclePlus, Search } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { useState } from "react";
import { timeAgo } from "@/utils/getTimePassed";

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

export default function MessengerSideBar({
	conversation,
	isDecrypting = false,
	decryptedMessages = {},
}: Props) {
	const router = useRouter();
	const { conversationId: currConvoId } = useParams();
	const [searchTerm, setSearchTerm] = useState("");
	const { toggleSidebar } = useSidebar();

	const filteredConvos = conversation?.filter((convo) => {
		const member = convo.conversationMember[0]?.user;
		if (!member) return false;
		return member.name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	return (
		<Sidebar collapsible="icon" className="overflow-hidden bg-sidebar">
			<SidebarHeader className="flex flex-row justify-between items-center group-data-[collapsible=icon]:justify-center md:px-2 px-0">
				<span className="inline group-data-[collapsible=icon]:hidden text-base px-2">
					Chat-TFU
				</span>
				<Button
					className="w-fit group-data-[collapsible=icon]:mx-auto md:size-auto size-3 p-2"
					asChild
				>
					<Link href="/messenger">
						<MessageCirclePlus className="size-4 group-data-[collapsible=icon]:inline-block" />
						<span className="group-data-[collapsible=icon]:hidden">New</span>
					</Link>
				</Button>
			</SidebarHeader>

			<SidebarGroup>
				<div className="w-full">
					<Search
						className="hidden group-data-[collapsible=icon]:block size-5 mx-auto cursor-pointer"
						onClick={() => toggleSidebar()}
					/>
					<Input
						type="search"
						placeholder="Search for a conversation"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onFocus={() => {
							if (window.innerWidth < 768.5) toggleSidebar();
						}}
						className="group-data-[collapsible=icon]:hidden"
					/>
				</div>
			</SidebarGroup>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Conversations</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="flex flex-col gap-1">
							{filteredConvos && filteredConvos.length > 0 ? (
								filteredConvos.map((convo) => {
									const latestMsg = convo.Message?.[0];
									const display = isDecrypting
										? "Decrypting..."
										: decryptedMessages[convo.id] ??
										  (latestMsg
												? "(No decrypted content)"
												: "(No latest message)");
									const member = convo.conversationMember[0]?.user;
									return (
										<SidebarMenuItem
											key={convo.id}
											onClick={() => {
												router.push(`/messenger/conversation/${convo.id}`);
												if (window.innerWidth < 768.5) {
													toggleSidebar();
												}
											}}
											className="h-full"
										>
											<SidebarMenuButton
												className={`flex items-center gap-2 h-full hover:bg-accent-foreground/10 hover:cursor-pointer py-2 ${
													currConvoId === convo.id &&
													"bg-primary group-data-[collapsible=icon]:bg-background text-background hover:bg-primary group-data-[collapsible=icon]:hover:bg-background active:bg-primary active:text-background hover:text-background"
												}`}
											>
												<Image
													src={member?.image || "https://placehold.co/32/webp"}
													alt={member?.name || "User"}
													height={32}
													width={32}
													className="rounded-full"
												/>
												<div className="flex-1 min-w-0 flex flex-col gap-1">
													<p className="truncate font-medium">{member?.name}</p>
													<div
														className={`flex justify-between text-xs truncate ${
															currConvoId === convo.id && "text-background/75"
														}`}
													>
														<p className="truncate max-w-32">{display}</p>
														<p>
															{timeAgo(new Date(convo.createdAt))}
														</p>
													</div>
												</div>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})
							) : (
								<SidebarMenuItem className="h-full cursor-not-allowed">
									<SidebarMenuButton className="flex group-data-[collapsible=icon]:justify-center items-center h-full" disabled>
										<div className="flex gap-2">
											<Mail className="size-4 inline" />
											<p className="group-data-[collapsible=icon]:hidden text-gray-500">
												{searchTerm
													? "No matching conversations..."
													: "No conversations yet..."}
											</p>
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
