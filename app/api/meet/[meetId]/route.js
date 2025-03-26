// /api/meet/[meetId]/route.js
import { NextResponse } from "next/server";

// In-memory store for tracking signaling messages in each meeting
const signalingMessages = {};

export async function GET(req, { params }) {
    const { meetId } = params;

    // Initialize the signaling message queue for this meeting
    if (!signalingMessages[meetId]) {
        signalingMessages[meetId] = [];
    }

    // Return the latest signaling messages
    const messages = signalingMessages[meetId];
    signalingMessages[meetId] = []; // Clear the queue after returning messages

    return NextResponse.json(messages);
}

export async function POST(req, { params }) {
    const { meetId } = params;
    const data = await req.json();

    // Store the signaling message in the queue
    if (!signalingMessages[meetId]) {
        signalingMessages[meetId] = [];
    }

    signalingMessages[meetId].push(data);

    return NextResponse.json({ success: true });
}