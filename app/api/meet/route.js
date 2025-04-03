import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getUser } from "@/util/getUser";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
    try {
        // Get the authenticated user's ID
        const userId = await getUser();

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Parse the request body to get the PeerJS-generated host peer ID
        const body = await req.json();
        const { hostPeerId } = body;

        if (!hostPeerId || typeof hostPeerId !== "string") {
            return NextResponse.json({ error: "Host Peer ID is required and must be a string" }, { status: 400 });
        }

        // Generate a unique meet ID
        const meetId = nanoid(10);

        // Insert the meeting into Supabase
        const { data, error } = await supabase
            .from('meetings')
            .insert([
                {
                    meet_id: meetId,
                    host_id: hostPeerId, // Store the PeerJS peer ID as the host ID
                    participants: [hostPeerId] // Initialize participants with the host's peer ID
                }
            ])
            .select();

        if (error) {
            console.error("Error creating meeting in Supabase:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Return the meet ID
        return NextResponse.json({
            meetId: data[0].meet_id,
            hostPeerId: data[0].host_id
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}