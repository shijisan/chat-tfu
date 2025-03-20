export default function ContactNav(){
    return(
        <>
        <nav className="w-full h-[5vh] fixed bottom-0 left-0 bg-blue-500 z-50">
            <ul className="flex justify-evenly items-center h-full text-white">
                <li>Chats</li>
                <li>Video Meet</li>
                <li><a href="/account">Account</a></li>
                <li><a href="/">Home</a></li>
            </ul>
        </nav>
        </>
    )
}