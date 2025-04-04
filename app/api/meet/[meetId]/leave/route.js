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

        // Fetch the meeting to validate its existence and participants
        const { data: meetingData, error: meetingError } = await supabase
            .from("meetings")
            .select("participants")
            .eq("meet_id", meetId)
            .single();

        if (meetingError) {
            console.error("Error fetching meeting:", meetingError);
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const { participants } = meetingData;

        // Check if the participant exists in the meeting
        if (!participants.includes(peerId)) {
            return NextResponse.json({ error: "You are not a participant in this meeting" }, { status: 400 });
        }

        // Remove the participant from the participants array
        const updatedParticipants = participants.filter((participant) => participant !== peerId);

        if (updatedParticipants.length === 0) {
            // No participants left, delete the meeting room
            const { error: deleteError } = await supabase
                .from("meetings")
                .delete()
                .eq("meet_id", meetId);

            if (deleteError) {
                console.error("Error deleting meeting:", deleteError);
                return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
            }

            console.log(`Meeting room ${meetId} deleted.`);
            return NextResponse.json({ message: "Meeting room deleted." });
        }

        // Update the participants list in the database
        const { error: updateError } = await supabase
            .from("meetings")
            .update({ participants: updatedParticipants })
            .eq("meet_id", meetId);

        if (updateError) {
            console.error("Error updating participants:", updateError);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        console.log(`Participant ${peerId} left meeting ${meetId}.`);
        return NextResponse.json({
            success: true,
            message: "Participant removed from meeting.",
            remainingParticipants: updatedParticipants,
        });
    } catch (error) {
        console.error("Error leaving meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}