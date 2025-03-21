"use client"

import { useState, useEffect, useRef } from "react";
import AddContactModal from "./AddContactModal";


export default function Sidebar({ onContactClick, activeContactId }) {
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
	  <aside className="md:max-w-sm w-full border flex-grow">
		 <div className="mb-4 p-4">
			<button
			  onClick={() => setIsModalOpen(true)}
			  className="btn bg-blue-500 w-full py-2 text-white rounded-md"
			>
			  Add Contact
			</button>
		 </div>
 
		 {isModalOpen && <AddContactModal onAddContact={fetchContacts} />}
 
		 {contacts.length > 0 ? (
			<ul className="flex flex-col scroll-y-auto">
			  {contacts.map((contact) => (
				 <li
					key={`contact-${contact.id}`}
					className={`px-4 py-2 cursor-pointer truncate ${
					  contact.id === activeContactId
						 ? "bg-blue-500 text-white hover:brightness-105"
						 : "hover:brightness-95"
					}`}
					onClick={() => onContactClick(contact.id, contact.friend?.username || `Contact ${contact.id}`)}
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
 