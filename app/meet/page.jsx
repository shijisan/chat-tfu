// app/meet/page.jsx

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Meet() {
    const videoRef = useRef(null);
    const router = useRouter();

    // Function to access the camera and display the stream
    useEffect(() => {
        let localStream = null;

        const getCameraStream = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true });

                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
            }
        };

        getCameraStream();

        // Cleanup the stream when the component unmounts
        return () => {
            if (localStream) {
                const tracks = localStream.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    // Handle joining a meeting
    const handleJoinMeeting = (e) => {
        e.preventDefault();
        const meetIdInput = e.target.meetId; // Access the input field directly
        const meetId = meetIdInput.value.trim(); // Get the entered meeting ID

        if (meetId) {
            // Redirect to the meeting page
            router.push(`/meet/${meetId}`);
        } else {
            alert("Please enter a valid meeting code.");
        }
    };

    // Handle creating a meeting
    const handleCreateMeeting = async () => {
        try {
            // Call the API to create a new meeting
            const response = await fetch("/api/meet", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to create meeting");
            }

            const { meetId } = await response.json();

            // Redirect to the newly created meeting page
            router.push(`/meet/${meetId}`);
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("An error occurred while creating the meeting. Please try again.");
        }
    };

    return (
        <>
            <main className="flex md:px-[10vw] min-h-screen w-full">
                <div className="flex w-full">
                    {/* Video Stream */}
                    <div className="w-1/2 flex justify-center items-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="rounded-lg w-full max-w-md"
                        />
                    </div>

                    {/* Meeting Code Input and Create Button */}
                    <div className="w-1/2 flex items-center justify-center">
                        <div className="flex flex-col space-y-4">
                            <h1 className="text-lg font-bold">Start or Join a Meeting</h1>

                            {/* Create Meeting Button */}
                            <button
                                onClick={handleCreateMeeting}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Create Meeting
                            </button>

                            {/* Join Meeting Form */}
                            <form onSubmit={handleJoinMeeting}>
                                <div className="flex flex-col space-y-2">
                                    <input
                                        name="meetId"
                                        className="bg-neutral-300 rounded-lg py-2 px-4 min-w-[200px]"
                                        type="text"
                                        placeholder="Enter meeting code"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Join Meeting
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}