"use client";
import { useState } from "react";

export default function AddContactModal({ onAddContact }) {
    const [email, setEmail] = useState("");
    const [id, setId] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email && !id) {
            alert("Please enter either an email or an ID.");
            return;
        }

        try {
            const requestBody = {};
            if (email) requestBody.email = email;
            if (id) requestBody.id = id;

            const res = await fetch("/api/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to add contact");
            }

            onAddContact();

            setEmail("");
            setId("");

            alert("Contact added successfully!");
        } catch (error) {
            console.error("Error adding contact:", error.message);
            alert("Failed to add contact. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card-md card p-4">
            <div className="mb-4">
                <input
                    type="email"
                    placeholder="Enter contact email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                />
            </div>

            <div className="mb-4 text-center">
                <p>OR</p>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter contact ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                />
            </div>

            <div>
                <button
                    type="submit"
                    className="btn bg-blue-500 w-full py-2 text-white rounded-md"
                >
                    Add Contact
                </button>
            </div>
        </form>
    );
}