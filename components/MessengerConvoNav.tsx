"use client"

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/app/messenger/page";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { ArrowLeft } from "lucide-react";

type ExtendedUser = User & {
	email: string,
}

export default function MessengerConvoNav() {

	const [otherConvoMember, setOtherConvoMember] = useState<ExtendedUser>()

	const { conversationId } = useParams();

	const { toggleSidebar } = useSidebar();

	const fetchOtherConvoMember = useCallback(async () => {
		try {
			const res = await fetch(`/api/messenger/conversations/${conversationId}/other-convo-member/`);

			if (!res.ok) {
				throw new Error(`Failed to fetch. Status: ${res.status}`);
			}

			const data = await res.json();
			console.log("fetched other convo member", data);

			if (data?.otherConvoMember) {
				setOtherConvoMember(data.otherConvoMember.user);
				return { success: true, data: data.otherConvoMember.user };
			} else {
				throw new Error("Other conversation member not found. Maybe encryption password missing?");
			}
		} catch (err) {
			console.log("Failed to fetch conversation member, encryption password needed.", err);
			return;
		}
	}, [setOtherConvoMember, conversationId]);


	useEffect(() => {
		fetchOtherConvoMember();
	}, [conversationId, fetchOtherConvoMember]);

	return (
		<>
			<nav className="p-2 bg-card shadow-sm z-30 md:hidden">
				<div className="flex gap-16 items-center">
					<div className="flex gap-2 items-center">
						<div>
							<Button
								variant="ghost"
								onClick={toggleSidebar}
								className="p-1!"
							>
								<ArrowLeft
									className="text-muted-foreground inline"
								/>
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Image
								src={otherConvoMember?.image || "https://placehold.co/32/webp"}
								alt={`${otherConvoMember?.name || "Other convo member"}'s Profile Photo`}
								height={32} width={32}
								className="rounded-full"
							/>
							<p className="truncate max-w-xs">{otherConvoMember?.name}</p>
						</div>
					</div>
				</div>
			</nav>
		</>
	)
}