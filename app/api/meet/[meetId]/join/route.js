import { NextResponse } from "next/server";
import { getUser } from "@/util/getUser";
import { supabase } from "@/lib/supabase";

export async function POST(req, { params }) {
    try {
        const { meetId } = await params; // Extract the dynamic `meetId` parameter
        const userId = await getUser(); // Get the authenticated user's ID

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Parse the request body to get the PeerJS-generated peer ID
        const body = await req.json();
        const { peerId } = body;

        if (!peerId || typeof peerId !== "string") {
            return NextResponse.json({ error: "Peer ID is required and must be a string" }, { status: 400 });
        }

        // Fetch the meeting to validate the host ID and participants
        const { data: meetingData, error: meetingError } = await supabase
            .from('meetings')
            .select('host_id, participants')
            .eq('meet_id', meetId)
            .single();

        if (meetingError) {
            console.error("Error fetching meeting:", meetingError);
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const { host_id, participants } = meetingData;

        // Prevent duplicate entries
        if (participants.includes(peerId)) {
            return NextResponse.json({ error: "You are already a participant in this meeting" }, { status: 400 });
        }

        // Add the peer ID to the participants array
        const updatedParticipants = [...participants, peerId];
        const { error: updateError } = await supabase
            .from('meetings')
            .update({ participants: updatedParticipants })
            .eq('meet_id', meetId);

        if (updateError) {
            console.error("Error updating participants:", updateError);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Joined meeting successfully",
            peerId,
            hostId: host_id
        });
    } catch (error) {
        console.error("Error joining meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}