"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Peer from "peerjs";

export default function Meet() {
    const videoRef = useRef(null);
    const router = useRouter();
    const [peerId, setPeerId] = useState(null); // Local peer ID (generated by PeerJS)
    const [remoteStreams, setRemoteStreams] = useState([]); // Tracks remote video streams
    const localStream = useRef(null); // Local media stream
    const peerInstance = useRef(null); // Reference to the PeerJS instance

    // Access user's camera and initialize PeerJS
    useEffect(() => {
        const initializePeerJS = async () => {
            try {
                // Access the user's camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                localStream.current = stream;

                // Initialize PeerJS
                const peer = new Peer();
                peerInstance.current = peer;

                // Set the local peer ID
                peer.on("open", (id) => {
                    console.log("My Peer ID:", id);
                    setPeerId(id);
                });

                // Handle incoming calls
                peer.on("call", (call) => {
                    console.log("Incoming call from:", call.peer);

                    // Answer the call with the local stream
                    call.answer(stream);

                    // Handle the remote stream
                    call.on("stream", (remoteStream) => {
                        console.log("Received remote stream from:", call.peer);
                        setRemoteStreams((prev) => {
                            if (!prev.find((stream) => stream.id === remoteStream.id)) {
                                return [...prev, remoteStream];
                            }
                            return prev;
                        });
                    });

                    call.on("close", () => {
                        console.log("Call ended with peer:", call.peer);
                        setRemoteStreams((prev) =>
                            prev.filter((stream) => stream.id !== call.remoteStream?.id)
                        );
                    });
                });
            } catch (err) {
                console.error("Error accessing camera or initializing PeerJS:", err);
            }
        };

        initializePeerJS();

        // Cleanup the stream when the component unmounts
        return () => {
            if (localStream.current) {
                console.log("Stopping local stream tracks...");
                localStream.current.getTracks().forEach((track) => track.stop());
            }

            if (peerInstance.current) {
                peerInstance.current.destroy();
                console.log("PeerJS instance destroyed.");
            }
        };
    }, []);

    // Add a remote video stream to the UI
    const addRemoteVideo = (stream) => {
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.autoPlay = true;
        videoElement.playsInline = true;
        videoElement.className = "rounded-lg w-full max-w-md mt-4";
        document.body.appendChild(videoElement); // Append to the body or a container
    };

    // Handle joining a meeting
    const handleJoinMeeting = async (e) => {
        e.preventDefault();

        // Access the meeting ID input field
        const meetIdInput = e.target.meetId; // Access the input field directly
        const meetId = meetIdInput.value.trim(); // Get the entered meeting ID

        if (!meetId) {
            alert("Please enter a valid meeting code.");
            return;
        }

        if (!peerId) {
            alert("Peer ID not initialized. Please wait and try again.");
            return;
        }

        try {
            console.log("Joining meeting with Peer ID:", peerId);

            // Join the meeting using the PeerJS-generated peer ID
            const response = await fetch(`/api/meet/${meetId}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Ensure the content type is set to JSON
                },
                body: JSON.stringify({ peerId }), // Pass the PeerJS-generated peer ID as JSON
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to join meeting");
            }

            const { success, message } = await response.json();

            if (success) {
                console.log(message);

                // Fetch the list of participants
                const participantsResponse = await fetch(`/api/meet/${meetId}`);
                const { participants } = await participantsResponse.json();

                // Connect to all other participants
                participants.forEach((participantPeerId) => {
                    if (participantPeerId !== peerId) {
                        connectToPeer(participantPeerId);
                    }
                });

                // Redirect to the meeting page
                router.push(`/meet/${meetId}?peerId=${peerId}`);
            } else {
                throw new Error("Failed to join meeting");
            }
        } catch (error) {
            console.error("Error joining meeting:", error);
            alert("An error occurred while joining the meeting. Please try again.");
        }
    };

    // Connect to a remote peer
    const connectToPeer = (remotePeerId) => {
        if (!peerInstance.current || !localStream.current) {
            console.error("PeerJS instance or local stream not ready.");
            return;
        }

        console.log("Calling peer:", remotePeerId);

        const call = peerInstance.current.call(remotePeerId, localStream.current);

        call.on("stream", (remoteStream) => {
            console.log("Received remote stream:", remoteStream);
            setRemoteStreams((prev) => {
                if (!prev.find((stream) => stream.id === remoteStream.id)) {
                    return [...prev, remoteStream];
                }
                return prev;
            });
        });

        call.on("close", () => {
            console.log("Call ended with peer:", remotePeerId);
            setRemoteStreams((prev) =>
                prev.filter((stream) => stream.id !== call.remoteStream?.id)
            );
        });
    };

    // Handle creating a meeting
    const handleCreateMeeting = async () => {
        try {
            if (!peerId) {
                alert("Peer ID not initialized. Please wait and try again.");
                return;
            }

            // Call the API to create a new meeting, passing the host's PeerJS peer ID
            const response = await fetch("/api/meet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ hostPeerId: peerId }), // Pass the PeerJS-generated peer ID
            });

            if (!response.ok) {
                throw new Error("Failed to create meeting");
            }

            const { meetId } = await response.json();

            // Redirect to the newly created meeting page
            router.push(`/meet/${meetId}?peerId=${peerId}`);
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("An error occurred while creating the meeting. Please try again.");
        }
    };

    return (
        <>
            <main className="flex md:px-[10vw] min-h-screen w-full">
                <div className="flex md:flex-row flex-col justify-center items-center w-full">
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

                            {/* Display Current User's Peer ID */}
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold">Your Peer ID</h2>
                                <p className="bg-gray-100 px-4 py-2 rounded-lg w-full max-w-md text-center">
                                    {peerId || "Loading..."}
                                </p>
                            </div>

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