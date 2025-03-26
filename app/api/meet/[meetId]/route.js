// /api/meet/[meetId]/route.js
import { NextResponse } from "next/server";

// In-memory store for tracking clients in each meeting
const clients = {};

export async function GET(req, { params }) {
    const { meetId } = await params;

    // Initialize the stream for this meeting
    if (!clients[meetId]) {
        clients[meetId] = [];
    }

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data) => {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Add the client to the meeting's list of connected clients
            const client = { send: sendEvent };
            clients[meetId].push(client);

            // Cleanup: remove the client when the connection is closed
            req.signal.addEventListener("abort", () => {
                clients[meetId] = clients[meetId].filter((c) => c !== client);
                controller.close();
            });
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

export async function POST(req, { params }) {
    const { meetId } = await params;
    const data = await req.json();

    // Broadcast the message to all clients in the meeting
    if (clients[meetId]) {
        clients[meetId].forEach((client) => client.send(data));
    }

    return NextResponse.json({ success: true });
}