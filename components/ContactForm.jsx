"use client";

import { useState } from "react";
import { FaCircleUser, FaHeading, FaAlignLeft, FaEnvelope } from "react-icons/fa6";

export default function ContactsSection() {
   const [formData, setFormData] = useState({
      senderEmail: "",
      senderSubject: "",
      senderMessage: "",
   });
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState("");
   const [error, setError] = useState("");

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setSuccess("");
      setError("");

      try {
         const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         const data = await response.json();
         if (!response.ok) throw new Error(data.error);

         setSuccess("✅ Email sent successfully!");
         setFormData({ senderEmail: "", senderSubject: "", senderMessage: "" });

      } catch (error) {
         setError("❌ Failed to send email. Please try again.");
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="flex flex-row justify-center py-[8vh] md:px-auto px-4 items-center md:px-[10vw]"  id="contact">
         <form onSubmit={handleSubmit} className="rounded-lg bg-white w-full min-h-96 shadow-md flex flex-row">

            <div className="md:w-1/2 md:block hidden">
               <img src="feedback.jpg"
                  className="rounded-l-lg bg-blue-500 object-cover object-center" />
            </div>

            <div className="md:w-1/2 w-full">
               <div className="pt-4 pb-3 border-b-2 border-blue-500">
                  <h1 className="poppins text-3xl text-center">Send me an Email</h1>
               </div>
               <div className="py-4 px-8 space-y-3">
                  
                  <div className="form-group">
                     <label htmlFor="senderEmail" className="flex items-center">
                        <FaCircleUser className="me-2" /> Your Email
                     </label>
                     <input type="email" id="senderEmail" value={formData.senderEmail} onChange={handleChange}
                        placeholder="yourEmail@domain.com" required className="w-full p-2 rounded-md bg-background border border-neutral-300" />
                  </div>

                  <div className="form-group">
                     <label htmlFor="senderSubject" className="flex items-center">
                        <FaHeading className="me-2" /> Email Subject
                     </label>
                     <input type="text" id="senderSubject" value={formData.senderSubject} onChange={handleChange}
                        placeholder="Your Subject" required className="w-full p-2 rounded-md verify bg-background border border-neutral-300" />
                  </div>

                  <div className="form-group">
                     <label htmlFor="senderMessage" className="flex items-center">
                        <FaAlignLeft className="me-2" /> Your Message
                     </label>
                     <textarea id="senderMessage" value={formData.senderMessage} onChange={handleChange}
                        placeholder="Your message goes here." required rows={4} className="w-full p-2 rounded-md bg-background border border-neutral-300"></textarea>
                  </div>

                  <div>
                     <button type="submit" disabled={loading} className="btn w-full rounded-full bg-blue-500 flex items-center justify-center py-3">
                        {loading ? <>Sending Email...</>: <><FaEnvelope className="me-2" /> Send Email</>}
                     </button>
                  </div>

                  {success && <p className="text-green-500 text-center">{success}</p>}
                  {error && <p className="text-red-500 text-center">{error}</p>}

               </div>
            </div>

         </form>
      </section>
   );
}