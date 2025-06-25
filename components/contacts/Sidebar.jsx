"use client";

import { useState, useEffect } from "react";
import AddContactModal from "./AddContactModal";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function Sidebar({ onContactClick, activeContactId, isMobileOpen, onMobileToggle }) {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/contacts");
            if (!res.ok) return console.error("Error fetching contacts");
            const data = await res.json();
            setContacts(data.contacts);
            setFilteredContacts(data.contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error.message);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        const filtered = contacts.filter((contact) =>
            contact.friend?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredContacts(filtered);
    }, [searchQuery, contacts]);

    const handleContactClick = (contactId, contactName) => {
        onContactClick(contactId, contactName);
        // Close mobile sidebar when contact is selected
        if (onMobileToggle) onMobileToggle(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => onMobileToggle(false)}
                />
            )}

            <aside className={`
                w-full md:w-1/4 h-full flex flex-col rounded-3xl border border-neutral-300 bg-white
                md:relative md:translate-x-0 md:z-auto
                fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="border-b border-neutral-300 flex gap-2 p-4">
                    <input
                        type="search"
                        className="w-full py-2 px-4 bg-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search Messenger"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setIsModalOpen(!isModalOpen)}
                        className="flex items-center justify-center w-10 h-10 bg-neutral-200 text-black rounded-full hover:bg-neutral-300 transition-colors"
                    >
                        {isModalOpen ? <FaTimes /> : <FaPlus />}
                    </button>
                </div>

                {isModalOpen && (
                    <AddContactModal
                        onAddContact={fetchContacts}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}

                <div className="flex-1 overflow-hidden">
                    {filteredContacts.length > 0 ? (
                        <ul className="h-full overflow-y-auto p-2 space-y-1">
                            {filteredContacts.map((contact) => (
                                <li
                                    key={`contact-${contact.id}`}
                                    className={`
                                        px-4 py-3 cursor-pointer rounded-lg transition-all duration-200
                                        ${contact.id === activeContactId
                                            ? "bg-blue-100 text-blue-800"
                                            : "hover:bg-neutral-100"
                                        }
                                    `}
                                    onClick={() => handleContactClick(
                                        contact.id,
                                        contact.friend?.username || `Contact ${contact.id}`
                                    )}
                                >
                                    <div className="truncate font-medium">
                                        {contact.friend?.username || `Contact ${contact.id}`}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-neutral-500">
                            <p>No contacts found.</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}