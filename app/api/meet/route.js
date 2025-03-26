// /api/meet/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming you are using Prisma ORM
import { nanoid } from "nanoid"; // Use nanoid for generating unique IDs
import { getUser } from "@/util/getUser"; // Import the getUser utility

export async function POST(req) {
    try {
        // Get the authenticated user's ID
        const userId = await getUser();

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Generate a unique meet ID
        const meetId = nanoid(10);

        // Create the meeting and associate it with the host (user)
        const newMeet = await prisma.meeting.create({
            data: {
                meetId,
                createdAt: new Date(),
                host: {
                    connect: { id: userId }, // Connect the meeting to the authenticated user
                },
            },
        });

        // Log the creation of the meeting (optional, for debugging purposes)
        console.log(`Meeting created: ${newMeet.meetId}`);

        // Return the meet ID
        return NextResponse.json({ meetId: newMeet.meetId });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}