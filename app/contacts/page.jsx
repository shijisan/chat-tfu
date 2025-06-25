"use client";

import { useState } from "react";
import Sidebar from "@/components/contacts/Sidebar";
import Messages from "@/components/contacts/Messages";

export default function ChatContainer() {
    const [activeContactId, setActiveContactId] = useState(null);
    const [activeContactName, setActiveContactName] = useState("");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleContactClick = (contactId, contactName) => {
        setActiveContactId(contactId);
        setActiveContactName(contactName);
    };

    const handleMobileSidebarToggle = (isOpen) => {
        setIsMobileSidebarOpen(isOpen);
    };

    return (
        <div className="h-[95vh] md:p-8 bg-neutral-50">
            <div className="h-full flex gap-8 max-w-7xl mx-auto">
                <Sidebar
                    onContactClick={handleContactClick}
                    activeContactId={activeContactId}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileToggle={handleMobileSidebarToggle}
                />
                <Messages
                    contactId={activeContactId}
                    contactName={activeContactName}
                    onMobileToggle={handleMobileSidebarToggle}
                />
            </div>
        </div>
    );
}