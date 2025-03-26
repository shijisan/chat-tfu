import ContactNav from "@/components/contacts/Nav";

export default function ContactLayout({ children }) {
    return (
        <>
            {children}
            <ContactNav />

        </>
    );
}