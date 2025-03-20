"use client"

import { useRouter } from "next/navigation";

export default function Home() {

	const router = useRouter();

	return (
		<>
		<main className="md:px-[10vw]">
			<header className="min-h-screen flex md:flex-row flex-col">
				<div className="w-full md:w-1/2 flex items-center justify-center">
					<div className="space-y-4 md:pe-16">
						<h1 className="text-5xl font-medium poppins">Conversate without compromises!</h1>

						<p>Chat-TFU delivers secure messaging with end-to-end encryption, ensuring your conversations stay private. Blocking hackers and malicious threats that attempt to penetrate security and steal your data.</p>

						<div className="flex md:flex-row flex-col gap-4">
							<button className="btn bg-blue-500 rounded-full" onClick={() => router.push("/contacts")}>Try our Messenger Feature</button>
							<button className="text-blue-500 rounded-full border-2 border-blue-500 btn-outline " onClick={() => router.push("/meet")}>Try our Video Meet Feature</button>

						</div>
					</div>
				</div>
				<div className="w-full md:w-1/2 flex justify-center items-center">
					<img src="https://placehold.co/500/webp" className="rounded-lg" alt="Placeholder for hero image" />
				</div>
			</header>
			<section className="min-h-screen ">

			</section>
		</main>
		</>
	);
}