// app/meet/[meetId]/page.jsx

"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Peer from "peerjs";

export default function MeetingPage() {
    const params = useParams();
    const { meetId } = params;

    const localVideoRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [targetPeerId, setTargetPeerId] = useState(""); // State for target peer ID
    const localStream = useRef(null);
    const peerInstance = useRef(null);

    // Ref to store references to all remote video elements
    const remoteVideoRefs = useRef({});

    // Access user's camera and display the local stream
    useEffect(() => {
        const getCameraStream = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
                console.log("Local stream initialized:", localStream.current);
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        getCameraStream();

        return () => {
            if (localStream.current) {
                console.log("Stopping local stream tracks...");
                localStream.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Set up PeerJS and handle connections
    useEffect(() => {
        let peer;

        // Initialize PeerJS
        peer = new Peer({
            host: "0.peerjs.com", // PeerJS cloud-hosted signaling server
            port: 443,
            path: "/",
        });

        peerInstance.current = peer;

        // When the peer is ready
        peer.on("open", (id) => {
            console.log("My peer ID is:", id);
        });

        // Handle incoming calls
        peer.on("call", (call) => {
            console.log("Received call from:", call.peer);

            // Answer the call with the local stream
            call.answer(localStream.current);

            // Handle the remote stream
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
                console.log("Call ended with peer:", call.peer);
                setRemoteStreams((prev) =>
                    prev.filter((stream) => stream.id !== call.remoteStream?.id)
                );
            });
        });

        // Cleanup on unmount
        return () => {
            if (peer) {
                peer.destroy();
                console.log("PeerJS instance destroyed.");
            }
        };
    }, [meetId]);

    // Call another peer when joining a meeting
    const callPeer = (peerId) => {
        if (!targetPeerId) {
            console.error("Please enter a valid peer ID.");
            alert("Please enter a valid peer ID.");
            return;
        }

        if (!peerInstance.current || !localStream.current) {
            console.error("PeerJS instance or local stream not ready.");
            alert("PeerJS instance or local stream not ready.");
            return;
        }

        console.log("Calling peer:", peerId);

        const call = peerInstance.current.call(peerId, localStream.current);

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
            console.log("Call ended with peer:", peerId);
            setRemoteStreams((prev) =>
                prev.filter((stream) => stream.id !== call.remoteStream?.id)
            );
        });
    };

    // Update remote video elements whenever remoteStreams changes
    useEffect(() => {
        remoteStreams.forEach((stream) => {
            const videoRef = remoteVideoRefs.current[stream.id];
            if (videoRef && stream) {
                videoRef.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Meeting ID: {meetId}</h1>

            {/* Local Video Stream */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">You</h2>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-md rounded-lg bg-black"
                />
            </div>

            {/* Remote Video Streams */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Participants</h2>
                {remoteStreams.length > 0 ? (
                    remoteStreams.map((stream) => {
                        // Create a ref for each remote video element
                        remoteVideoRefs.current[stream.id] = remoteVideoRefs.current[stream.id] || {};

                        return (
                            <div key={stream.id} className="mb-2">
                                <video
                                    ref={(el) => {
                                        remoteVideoRefs.current[stream.id] = el;
                                    }}
                                    autoPlay
                                    playsInline
                                    className="w-full max-w-md rounded-lg bg-black"
                                />
                            </div>
                        );
                    })
                ) : (
                    <p>No participants yet.</p>
                )}
            </div>

            {/* Input Field for Peer ID */}
            <div className="mb-4 w-full max-w-md">
                <input
                    type="text"
                    placeholder="Enter Peer ID"
                    value={targetPeerId}
                    onChange={(e) => setTargetPeerId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mb-2"
                />
                <button
                    onClick={() => callPeer(targetPeerId)} // Use the entered peer ID
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
                >
                    Call Participant
                </button>
            </div>
        </div>
    );
}