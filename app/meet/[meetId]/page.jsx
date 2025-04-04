"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Peer from "peerjs";

export default function MeetingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { meetId } = params;
    const localVideoRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]); // Tracks remote video streams with peerId
    const [currentPeerId, setCurrentPeerId] = useState(""); // Current user's Peer ID
    const localStream = useRef(null); // Local media stream
    const peerInstance = useRef(null); // PeerJS instance
    const [participants, setParticipants] = useState([]); // List of participants in the meeting
    const [isMuted, setIsMuted] = useState(true); // State to track mute status
    const [isCameraOn, setIsCameraOn] = useState(true); // State to track camera status
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [audioStream, setAudioStream] = useState(null);

    // Retrieve the Peer ID from the query parameters
    useEffect(() => {
        const peerIdFromUrl = searchParams.get("peerId");
        if (peerIdFromUrl) {
            setCurrentPeerId(peerIdFromUrl);
        }
    }, [searchParams]);

    // Access user's camera and display the local stream
    useEffect(() => {
        const getCameraStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                localStream.current = stream;

                // Mute the audio tracks by default
                stream.getAudioTracks().forEach((track) => (track.enabled = false));
                console.log("Local stream initialized and muted:", stream);
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

    // Toggle mute/unmute functionality
    const toggleMute = () => {
        if (localStream.current) {
            const audioTracks = localStream.current.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled; // Toggle the enabled state
            });
            setIsMuted(!isMuted); // Update the state
            console.log(`Microphone ${isMuted ? "unmuted" : "muted"}`);
        }
    };

    // Toggle camera on/off functionality
    const toggleCamera = () => {
        if (localStream.current) {
            const videoTracks = localStream.current.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled; // Toggle the enabled state
            });
            setIsCameraOn(!isCameraOn); // Update the state
            console.log(`Camera ${isCameraOn ? "turned off" : "turned on"}`);
        }
    };

    // Initialize PeerJS and handle connections
    useEffect(() => {
        let peer;
        if (currentPeerId) {
            peer = new Peer(currentPeerId, {
                host: "0.peerjs.com", // PeerJS cloud-hosted signaling server
                port: 443,
                path: "/",
            });
            peerInstance.current = peer;

            // When the peer is ready
            peer.on("open", async () => {
                console.log("Reusing Peer ID:", currentPeerId);

                // Join the meeting and add the current user's peer ID
                try {
                    const response = await fetch(`/api/meet/${meetId}/join`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ peerId: currentPeerId }),
                    });
                    console.log("Joined meeting successfully.");
                } catch (error) {
                    console.error("Error joining meeting:", error);
                    alert("An error occurred while joining the meeting. Please try again.");
                }

                // Fetch the list of participants
                fetchParticipants();
            });

            // Handle incoming calls
            peer.on("call", (call) => {
                console.log("Received call from:", call.peer);

                // Ignore calls from the current user (host)
                if (call.peer === currentPeerId) {
                    console.log("Ignoring call from self:", call.peer);
                    return;
                }

                // Answer the call with the local stream
                call.answer(localStream.current);
                call.on("stream", (remoteStream) => {
                    console.log("Received remote stream from:", call.peer);
                    setRemoteStreams((prev) => {
                        // Replace the existing stream for this peerId with the new one
                        const updatedStreams = prev.map((item) =>
                            item.peerId === call.peer ? { ...item, stream: remoteStream } : item
                        );
                        // If no stream exists for this peerId, add it
                        if (!updatedStreams.some((item) => item.peerId === call.peer)) {
                            updatedStreams.push({ stream: remoteStream, peerId: call.peer });
                        }
                        return updatedStreams;
                    });
                });
                call.on("close", () => {
                    console.log("Call ended with peer:", call.peer);
                    setRemoteStreams((prev) =>
                        prev.filter((item) => item.peerId !== call.peer)
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
        }
    }, [meetId, currentPeerId]);

    // Fetch participants from the backend
    const fetchParticipants = async () => {
        try {
            const response = await fetch(`/api/meet/${meetId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch participants");
            }
            const { participants: fetchedParticipants } = await response.json();

            // Update the participants state
            setParticipants(fetchedParticipants);

            // Connect to all other participants
            fetchedParticipants.forEach((participantPeerId) => {
                // Avoid connecting to the current user or already connected peers
                if (
                    participantPeerId !== currentPeerId &&
                    !remoteStreams.find((item) => item.peerId === participantPeerId)
                ) {
                    connectToPeer(participantPeerId);
                }
            });
        } catch (error) {
            console.error("Error fetching participants:", error);
            alert("An error occurred while fetching participants. Please try again.");
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
            console.log("Received remote stream from:", call.peer);
            setRemoteStreams((prev) => {
                // Replace the existing stream for this peerId with the new one
                const updatedStreams = prev.map((item) =>
                    item.peerId === call.peer ? { ...item, stream: remoteStream } : item
                );
                // If no stream exists for this peerId, add it
                if (!updatedStreams.some((item) => item.peerId === call.peer)) {
                    updatedStreams.push({ stream: remoteStream, peerId: call.peer });
                }
                return updatedStreams;
            });
        });
        call.on("close", () => {
            console.log("Call ended with peer:", remotePeerId);
            setRemoteStreams((prev) =>
                prev.filter((item) => item.peerId !== call.peer)
            );
        });
        call.on("error", (err) => {
            console.error("Error during call with peer:", remotePeerId, err);
            alert(`An error occurred while connecting to peer ${remotePeerId}. Please try again.`);
        });
    };

    // Update remote video elements whenever remoteStreams changes
    useEffect(() => {
        remoteStreams.forEach(({ stream }) => {
            const videoElement = document.getElementById(`remote-video-${stream.id}`);
            if (videoElement && stream) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    useEffect(() => {
        async function getAudioDevices() {
            try {
                // Request microphone permission
                await navigator.mediaDevices.getUserMedia({ audio: true });

                // Get available devices
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter((device) => device.kind === "audioinput");
                setAudioDevices(audioInputs);
            } catch (error) {
                console.error("Error accessing audio devices:", error);
            }
        }

        getAudioDevices();
    }, []);

    const handleDeviceChange = async (deviceId) => {
        setSelectedDeviceId(deviceId);
        try {
            // Get the new audio stream from the selected device
            const newAudioStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } },
            });

            // Replace the audio track in the existing localStream
            const newAudioTrack = newAudioStream.getAudioTracks()[0];
            if (localStream.current) {
                const oldAudioTracks = localStream.current.getAudioTracks();
                oldAudioTracks.forEach((track) => {
                    localStream.current.removeTrack(track); // Remove old audio tracks
                    track.stop(); // Stop the old track to free resources
                });
                localStream.current.addTrack(newAudioTrack); // Add the new audio track
            }

            // Notify all active calls about the new audio track
            const connections = peerInstance.current.connections;
            Object.keys(connections).forEach((remotePeerId) => {
                connections[remotePeerId].forEach((call) => {
                    const sender = call.peerConnection.getSenders().find((s) => s.track && s.track.kind === "audio");
                    if (sender) {
                        sender.replaceTrack(newAudioTrack); // Replace the audio track in the WebRTC connection
                    }
                });
            });

            console.log("Audio input switched successfully.");
        } catch (error) {
            console.error("Error switching audio device:", error);
        }
    };

    const disconnect = async () => {
        // Stop all local media tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach((track) => track.stop());
            console.log("Local media tracks stopped.");
        }

        // Destroy the PeerJS instance
        if (peerInstance.current) {
            peerInstance.current.destroy();
            console.log("PeerJS instance destroyed.");
        }

        // Notify the backend that the user has left the meeting
        try {
            const response = await fetch(`/api/meet/${meetId}/leave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peerId: currentPeerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to leave the meeting.");
            }

            console.log("User left the meeting successfully.");
        } catch (error) {
            console.error("Error leaving the meeting:", error);
            alert("An error occurred while leaving the meeting. Please try again.");
        }

        // Redirect to the /meet page
        window.location.href = "/meet";
    };

    useEffect(() => {
        const handleBeforeUnload = async () => {
            try {
                // Notify the backend that the user is leaving
                await fetch(`/api/meet/${meetId}/leave`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ peerId: currentPeerId }),
                    keepalive: true, // Ensures the request completes even if the page is closing
                });
                console.log("Notified backend of user leaving.");
            } catch (error) {
                console.error("Error notifying backend during unload:", error);
            }
        };

        // Add the event listener
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup the event listener on unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [meetId, currentPeerId]);


    return (
        <main className="flex flex-col items-center justify-center min-h-screen pt-[8vh]">
            <h1 className="text-2xl font-bold mb-4">Meeting ID: {meetId}</h1>

            {/* Display Current User's Peer ID */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Your Peer ID</h2>
                <p className="bg-gray-100 px-4 py-2 rounded-lg w-full max-w-md text-center">
                    {currentPeerId || "Loading..."}
                </p>
            </div>

            {/* Local Video Stream */}
            <div className="mb-4 flex flex-col max-w-lg">
                <h2 className="text-lg font-semibold">You</h2>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full flex-grow rounded-lg bg-black"
                />
                <div className="flex flex-col space-y-4 mt-4">
                    {/* Camera On/Off Button */}
                    <button
                        onClick={toggleCamera}
                        className={`btn ${isCameraOn ? "bg-green-500" : "bg-neutral-500"
                            } text-white font-semibold`}
                    >
                        {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                    </button>
                    {/* Mute/Unmute Button */}
                    <button
                        onClick={toggleMute}
                        className={`btn ${isMuted ? "bg-neutral-500" : "bg-green-500"
                            } text-white font-semibold`}
                    >
                        {isMuted ? "Unmute Mic" : "Mute Mic"}
                    </button>

                    <select
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        className="border p-2 mt-2 w-full rounded-sm truncate md:block hidden"
                    >
                        <option value="" disabled>Default Microphone</option>
                        {audioDevices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${device.deviceId}`}
                            </option>
                        ))}
                    </select>

                    <button className="btn text-red-500 hover:font-medium transition-all" onClick={disconnect} >Disconnect</button>
                </div>


            </div>

            {/* Remote Video Streams */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Participants</h2>
                {remoteStreams.length > 0 ? (
                    remoteStreams
                        .filter(({ peerId }) => peerId !== currentPeerId) // Exclude the host's stream
                        .map(({ stream, peerId }) => (
                            <div key={peerId} className="mb-2">
                                <p>{peerId}</p>
                                <video
                                    id={`remote-video-${stream.id}`}
                                    autoPlay
                                    playsInline
                                    className="w-full max-w-md rounded-lg bg-black"
                                />
                            </div>
                        ))
                ) : (
                    <p>No participants yet.</p>
                )}
            </div>
        </main>
    );
}