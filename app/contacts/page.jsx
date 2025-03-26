"use client"

import Sidebar from "@/components/contacts/Sidebar";
import Messages from "@/components/contacts/Messages";
import { useState } from "react";

export default function Contacts() {
  const [contactId, setContactId] = useState(null);
  const [contactName, setContactName] = useState("");

  const handleContactClick = (id, name) => {
    setContactId(id);
    setContactName(name);
  };

  return (
    <main className="flex min-h-screen">
      <Sidebar activeContactId={contactId} onContactClick={handleContactClick} />
      <div className="flex-grow w-full border border-neutral-300">
        {contactId ? (
          <Messages contactName={contactName} contactId={contactId} />
        ) : (
          <div className="min-h-[85vh] flex justify-center items-center">
            <p className="text-center text-gray-500">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </main>
  );
}
