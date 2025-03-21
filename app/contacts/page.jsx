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
      <div className="flex-grow w-full border">
        {contactId ? (
          <Messages contactName={contactName} contactId={contactId} />
        ) : (
          <p className="text-center text-gray-500">Select a contact to start chatting</p>
        )}
      </div>
    </main>
  );
}
