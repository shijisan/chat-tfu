// /api/meet/route.js
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import {getUser} from "@/util/getUser"; // Import the getUser utility
import { supabase } from "@/lib/supabase";

export async function POST(req) {
    try {
        // Get the authenticated user's ID
        const userId = await getUser();

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Generate a unique meet ID
        const meetId = nanoid(10);

        // Insert the meeting into Supabase
        const { data, error } = await supabase
            .from('meetings')
            .insert([{ meet_id: meetId, host_id: userId }])
            .select();

        if (error) {
            console.error("Error creating meeting in Supabase:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Return the meet ID
        return NextResponse.json({ meetId: data[0].meet_id });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}