"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function MeetingPage() {
    const params = useParams();
    const { meetId } = params;

    const localVideoRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]); // Store remote video streams
    const peers = useRef({}); // Track peer connections
    const userId = useRef(Math.random().toString(36).substring(7)); // Generate a unique ID for the user

    // Function to access the user's camera and display the local stream
    useEffect(() => {
        let localStream = null;

        const getCameraStream = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
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

    // Set up WebRTC and signaling
    useEffect(() => {
        const eventSource = new EventSource(`/api/meet/${meetId}`);
        const localPeerConnections = {};

        // Handle incoming signaling messages
        eventSource.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.to === userId.current) {
                // Only process messages intended for this user
                if (data.type === "offer") {
                    // Create a new peer connection for the remote peer
                    const peerConnection = createPeerConnection(data.from, localPeerConnections);

                    // Set the remote description
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

                    // Create an answer and send it back
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    // Send the answer back to the signaling server
                    fetch(`/api/meet/${meetId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "answer",
                            to: data.from,
                            from: userId.current,
                            answer: peerConnection.localDescription,
                        }),
                    });
                } else if (data.type === "answer") {
                    // Set the remote description for the existing peer connection
                    const peerConnection = localPeerConnections[data.from];
                    if (peerConnection) {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                    }
                } else if (data.type === "candidate") {
                    // Add the ICE candidate to the peer connection
                    const peerConnection = localPeerConnections[data.from];
                    if (peerConnection) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                }
            }
        };

        // Create a new peer connection
        const createPeerConnection = (peerId, localPeers) => {
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.l.google.com:19302", // Free Google STUN server
                    },
                ],
            });

            // Add local stream tracks to the peer connection
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
            });

            // Handle incoming remote streams
            peerConnection.ontrack = (event) => {
                setRemoteStreams((prev) => [...prev, event.streams[0]]);
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    fetch(`/api/meet/${meetId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "candidate",
                            to: peerId,
                            from: userId.current,
                            candidate: event.candidate,
                        }),
                    });
                }
            };

            localPeers[peerId] = peerConnection;
            return peerConnection;
        };

        // Send an SDP offer to all existing participants
        const sendOfferToParticipants = async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const peerConnection = createPeerConnection("all", localPeerConnections);

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            fetch(`/api/meet/${meetId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "offer",
                    from: userId.current,
                    to: "all",
                    offer: peerConnection.localDescription,
                }),
            });
        };

        sendOfferToParticipants();

        // Cleanup the EventSource on component unmount
        return () => {
            eventSource.close();
            Object.values(localPeerConnections).forEach((peer) => peer.close());
        };
    }, [meetId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Meeting ID: {meetId}</h1>

            {/* Local Video Stream */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">You</h2>
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full max-w-md rounded-lg" />
            </div>

            {/* Remote Video Streams */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Participants</h2>
                {remoteStreams.length > 0 ? (
                    remoteStreams.map((stream, index) => (
                        <div key={index} className="mb-2">
                            <video
                                srcObject={stream}
                                autoPlay
                                playsInline
                                className="w-full max-w-md rounded-lg"
                            />
                        </div>
                    ))
                ) : (
                    <p>No participants yet.</p>
                )}
            </div>
        </div>
    );
}