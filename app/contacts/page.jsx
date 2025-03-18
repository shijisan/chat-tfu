"use client";

import Sidebar from "@/components/contacts/Sidebar";
import Messages from "@/components/contacts/Messages";
import { useState } from "react";

export default function Contacts() {
    const [contactId, setContactId] = useState(null);

    return (
        <main className="flex min-h-screen">
            <Sidebar onContactClick={setContactId} />
            <div className="flex-grow w-full border p-8">
                {contactId ? (
                    <Messages contactId={contactId} />
                ) : (
                    <p className="text-center text-gray-500">Select a contact to start chatting</p>
                )}
            </div>
        </main>
    );
}
