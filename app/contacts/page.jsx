"use client";

import Sidebar from "@/components/contacts/Sidebar";
import Messages from "@/components/contacts/Messages";
import { useState } from "react";

export default function Contacts() {
  const [contactId, setContactId] = useState(null);
  const [contactName, setContactName] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  const handleContactClick = (id, name) => {
    setContactId(id);
    setContactName(name);
    setIsMobileSidebarOpen(false);
  };

  const handleBackButtonClick = () => {
    setIsMobileSidebarOpen(true);
    setContactId(null);
    setContactName("");
  };

  return (
    <main className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`md:w-1/4 w-full h-screen md:static fixed top-0 left-0 bg-white z-50 ${
          isMobileSidebarOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <Sidebar activeContactId={contactId} onContactClick={handleContactClick} />
      </div>

      {/* Messages or Prompt */}
      <div className="flex-grow min-h-screen w-full border border-neutral-300 flex flex-col pb-[8vh]">
        {/* Header with Back Button (Only on Mobile) */}
        {!isMobileSidebarOpen && contactId && (
          <div className="w-full h-[5vh] border-b px-4 flex items-center bg-white md:hidden">
            <button
              className="text-blue-500 me-2"
              onClick={handleBackButtonClick}
            >
              ← Back
            </button>
            <h2 className="font-bold">{contactName}</h2>
          </div>
        )}

        {/* Messages Component */}
        {contactId && (
          <Messages contactName={contactName} contactId={contactId} />
        )}

        {/* Prompt to Select a Contact */}
        {!contactId && (
          <div className="min-h-[85vh] flex justify-center items-center">
            <p className="text-center text-gray-500">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </main>
  );
}