// /api/meet/[meetId]/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req, { params }) {
    try {
        const { meetId } = await params; // Extract the dynamic `meetId` parameter
        const body = await req.json(); // Parse the request body

        // Validate the request body
        if (!body.type || !body.to || !body.from) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // Insert the signaling message into Supabase
        const { data, error } = await supabase
            .from('signaling')
            .insert([
                {
                    meet_id: meetId,
                    type: body.type, // "offer", "answer", or "candidate"
                    payload: body.payload, // The actual signaling data (SDP or ICE candidate)
                    to: body.to, // The recipient's user ID
                    from: body.from, // The sender's user ID
                },
            ])
            .select();

        if (error) {
            console.error("Error inserting signaling message:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Return success response
        return NextResponse.json({ success: true, message: "Signaling message sent" });
    } catch (error) {
        console.error("Error handling signaling message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        const { meetId } = await params; // Extract the dynamic `meetId` parameter

        // Fetch signaling messages for the meeting (optional, depending on your use case)
        const { data, error } = await supabase
            .from('signaling')
            .select('*')
            .eq('meet_id', meetId);

        if (error) {
            console.error("Error fetching signaling messages:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Return the signaling messages
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching signaling messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}