"use client";

import { useState, useEffect, useRef } from "react";
import AddContactModal from "./AddContactModal";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function Sidebar({ onContactClick, activeContactId }) {
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

    return (
        <aside className="md:max-w-sm w-full border border-neutral-300 flex-grow flex flex-col">
            <div className="border-b border-neutral-300 flex gap-2 p-2">
                {/* Search Input */}
                <input
                    type="search"
                    className="w-full py-2 px-4 bg-neutral-200 rounded-full"
                    placeholder="Search Mesnegger"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Toggle Modal Button */}
                <button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="btn bg-neutral-200 text-black rounded-full poppins aspect-square"
                >
                    {isModalOpen ? <FaTimes /> : <FaPlus />} {/* Dynamically switch icons */}
                </button>
            </div>

            {/* Conditionally Render the Modal */}
            {isModalOpen && (
                <AddContactModal
                    onAddContact={fetchContacts}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {filteredContacts.length > 0 ? (
                <ul className="flex flex-col scroll-y-auto flex-grow rounded max-h-[80vh] p-2">
                    {filteredContacts.map((contact) => (
                        <li
                            key={`contact-${contact.id}`}
                            className={`px-4 py-2 cursor-pointer truncate transition-all ${contact.id === activeContactId
                                    ? "bg-neutral-200 text-black hover:brightness-105"
                                    : "bg-background hover:brightness-[99%]"
                                }`}
                            onClick={() =>
                                onContactClick(
                                    contact.id,
                                    contact.friend?.username || `Contact ${contact.id}`
                                )
                            }
                        >
                            {contact.friend?.username || `Contact ${contact.id}`}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-4">
                    <p>No contacts found.</p>
                </div>
            )}
        </aside>
    );
}