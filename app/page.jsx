"use client"

import { useRouter } from "next/navigation";
import KofiWidgetOverlay from "@/components/KofiOverlayWidget";
import { FaLock, FaComments, FaVideo, FaCodeBranch } from "react-icons/fa";
import ContactsSection from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {

	const router = useRouter();
	const kofiOptions = {
		type: 'floating-chat',
		'floating-chat.donateButton.text': 'Support me',
		'floating-chat.donateButton.background-color': 'rgba(59, 130, 246, 0.7)',
		'floating-chat.donateButton.text-color': '#fff',
	};

	return (
		<>
			<main className="">
				<header className="py-[8vh] flex md:flex-row flex-col-reverse md:justify-normal justify-evenly md:px-[10vw]">
					<div className="w-full md:w-1/2 flex items-center justify-center md:p-auto p-4">
						<div className="space-y-4 md:pe-16">
							<h1 className="md:text-5xl text-3xl font-medium poppins md:text-start text-center">Conversate without compromises!</h1>

							<p>Chat-TFU delivers secure messaging with end-to-end encryption, ensuring your conversations stay private. Blocking hackers and malicious threats that attempt to penetrate security and steal your data.</p>

							<div className="flex md:flex-row flex-col gap-4">
								<button className="btn bg-blue-500 md:py-2 py-2.5 rounded-full" onClick={() => router.push("/contacts")}>Try our Messenger Feature</button>
								<button className="text-blue-500 rounded-full border-2 border-blue-500 btn-outline " onClick={() => router.push("/meet")}>Try our Video Meet Feature</button>

							</div>
						</div>
					</div>
					<div className="w-full md:w-1/2 flex justify-center items-center md:pt-auto pt-[8vh]">
						<img src="workchat.svg" className="rounded-lg" alt="Placeholder for hero image" />
					</div>
				</header>

				<div className="px-[10vw] w-full">
					<div className="w-full bg-neutral-300 h-[1px]"></div>
				</div>

				<section className="md:h-auto flex md:flex-row flex-col justify-center items-center py-[8vh] w-full md:px-[10vw]">
					<div className="md:flex justify-center items-center hidden w-1/2">
						<img className="aspect-square max-w-md bg-white " src="chatting.jpg" />
					</div>
					<div className="flex flex-col items-center md:w-1/2 w-full md:p-0 p-4">
						<h1 className="text-3xl poppins font-medium mb-8">Why Chat-TFU?</h1>

						<div className="grid md:grid-cols-2 md:grid-rows-2 grid-cols-1 grid-rows-4 gap-4 w-full">
							<div className="card flex flex-col items-center text-center p-4">
								<FaLock size={32} className="text-blue-500" />
								<h3 className="font-semibold mt-2 poppins text-lg">End-to-End Encryption</h3>
								<p className="text-sm mt-1">Messages are encrypted with AES-256-CBC using user-shared secrets, ensuring full privacy from end to end.
								</p>
							</div>

							<div className="card flex flex-col items-center text-center p-4">
								<FaComments size={32} className="text-blue-500" />
								<h3 className="font-semibold mt-2 poppins text-lg">Real-time Messaging</h3>
								<p className="text-sm mt-1">Instant communication with real-time updates and message reactions.
								</p>
							</div>

							<div className="card flex flex-col items-center text-center p-4">
								<FaVideo size={32} className="text-blue-500" />
								<h3 className="font-semibold mt-2 poppins text-lg">Peer-to-Peer Calls</h3>
								<p className="text-sm mt-1">Video & voice calls are P2P with WebRTC and PeerJS for fast, secure connection.</p>
							</div>

							<div className="card flex flex-col items-center text-center p-4">
								<FaCodeBranch size={32} className="text-blue-500" />
								<h3 className="font-semibold mt-2 poppins text-lg">Open Source</h3>
								<p className="text-sm mt-1">Built in public. Transparent, customizable, and made for privacy-first users.</p>
							</div>
						</div>
					</div>

				</section>

				<div className="px-[10vw] w-full">
					<div className="w-full bg-neutral-300 h-[1px]"></div>
				</div>
				
				
				<ContactsSection/>
				
				
				<section>
					<KofiWidgetOverlay username="shiji54n" options={kofiOptions} />
				</section>

				<Footer />

			</main>
		</>
	);
}