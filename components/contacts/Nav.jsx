export default function ContactNav(){
    return(
        <>
        <nav className="w-full h-[5vh] fixed bottom-0 left-0 bg-blue-500 z-50">
            <ul className="flex justify-evenly items-center h-full">
                <li>Chats</li>
                <li>Video Chat</li>
                <li><a href="/account">Account</a></li>
            </ul>
        </nav>
        </>
    )
}