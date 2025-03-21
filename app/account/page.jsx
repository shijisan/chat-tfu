"use client"

import Logout from "@/components/account/Logout";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import EditUsernameModal from "@/components/account/EditUsernameModal";

export default function Account() {

    const [userInfo, setUserInfo] = useState({});
    const [showUsernameModal, setShowUsernameModal] = useState(false);

    const getUser = async () => {
        try {
            const res = await fetch("/api/account");
            const data = await res.json();
            setUserInfo(data.user);
        }
        catch (error) {
            console.log("Error getting user info", error);
        }

    }

    useEffect(() => {
        getUser();
    }, [])

    return (
        <>
            <main className="pt-[8vh] md:px-[10vw] flex justify-center items-center min-h-screen">
                <div className="card-md card h-full border-neutral-300 border">
                    <div className="border-b border-neutral-300 pb-2">
                        <h1 className="poppins text-2xl">Your Account</h1>
                    </div>
                    <div className="w-full flex justify-between">
                        <p><span className="font-medium">Username:</span> {userInfo.username}</p>
                        <button className="btn bg-neutral-400 w-fit" onClick={() => setShowUsernameModal(!showUsernameModal)}>
                            <FaPen />
                        </button>

                    </div>
                    <p><span className="font-medium">Email: </span>{userInfo.email}</p>

                    <div className="flex justify-end">
                        <Logout />
                    </div>

                </div>
            </main>

            {showUsernameModal && <EditUsernameModal setUserInfo={setUserInfo} showUsernameModal={showUsernameModal} setShowUsernameModal={setShowUsernameModal} userInfo={userInfo} /> }
        </>
    );
}