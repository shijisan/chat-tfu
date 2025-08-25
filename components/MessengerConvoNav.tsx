"use client"
 
import { useState, useEffect } from "react";
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

	const fetchOtherConvoMember = async () => {
		const res = await fetch(`/api/messenger/conversations/${conversationId}/other-convo-member/`);
		const data = await res.json();
		console.log("fetched other convo member", data);
		setOtherConvoMember(data.otherConvoMember.user);
	}

	useEffect(() => {
		fetchOtherConvoMember();
	}, [conversationId]);

	return (
		<>
			<nav className="p-2 bg-card shadow-sm z-30">
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