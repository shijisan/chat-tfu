import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/util/getUser";

export async function GET() {
    try {
        const userId = await getUser();
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        const contacts = await prisma.contact.findMany({
            where: { userId },
            select: {
                id: true,
                friend: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                isFriend: true,
                blocked: true,
            },
        });

        return NextResponse.json(
            { message: "Contacts fetched successfully", contacts },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching contacts:", error.message);
        return NextResponse.json(
            { message: "Failed to fetch contacts" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const userId = await getUser();
        const { email, id } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        if (!id && !email) {
            return NextResponse.json(
                { message: "Either an ID or an email is required" },
                { status: 400 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser) {
            return NextResponse.json(
                { message: "Current user not found" },
                { status: 404 }
            );
        }

        let friend;
        if (id) {
            friend = await prisma.user.findUnique({
                where: { id: parseInt(id, 10) },
            });
        } else if (email) {
            friend = await prisma.user.findUnique({
                where: { email },
            });
        }

        if (!friend) {
            return NextResponse.json(
                { message: "Friend not found" },
                { status: 404 }
            );
        }

        const existingContact = await prisma.contact.findFirst({
            where: {
                OR: [
                    { userId: userId, friendId: friend.id },
                    { userId: friend.id, friendId: userId },
                ],
            },
        });

        if (existingContact) {
            return NextResponse.json(
                { message: "Contact already exists" },
                { status: 400 }
            );
        }

        const newContact = await prisma.contact.create({
            data: {
                userId: userId,
                friendId: friend.id,
                isFriend: false,
                blocked: false,
            },
        });

        const reverseContact = await prisma.contact.create({
            data: {
                userId: friend.id,
                friendId: userId,
                isFriend: false,
                blocked: false,
            },
        });

        return NextResponse.json(
            { message: "Contact added successfully", contact: newContact },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding contact:", error.message);
        return NextResponse.json(
            { message: "Failed to add contact" },
            { status: 500 }
        );
    }
}
