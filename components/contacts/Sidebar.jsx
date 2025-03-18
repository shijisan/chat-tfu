"use client";
import { useEffect, useState } from "react";
import AddContactModal from "./AddContactModal";

export default function Sidebar({ onContactClick }) {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) return console.error("Error fetching contacts");
      const data = await res.json();
      setContacts(data.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error.message);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <aside className="md:max-w-sm w-full border flex-grow p-4">
      <div className="mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-blue-500 w-full py-2 text-white rounded-md"
        >
          Add Contact
        </button>
      </div>

      {isModalOpen && <AddContactModal onAddContact={fetchContacts} />}

      {contacts.length > 0 ? (
        <ul className="flex flex-col">
          {contacts.map((contact) => (
            <li
              key={`contact-${contact.id}`} // Ensure unique key
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => onContactClick(contact.id)}
            >
              {contact.friend?.username || `Contact ${contact.id}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>No contacts found.</p>
      )}
    </aside>
  );
}