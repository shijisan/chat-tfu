import { useState } from "react";

export default function EditUsernameModal({ userInfo, setShowUsernameModal, setUserInfo }) {

    const [newUsername, setNewUsername] = useState(userInfo.username || "");

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/account/${userInfo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: userInfo.id, newUsername })
            });

            if (!res.ok) throw new Error("Failed to update username");

            const data = await res.json();

            setUserInfo((prev) => ({ ...prev, username: data.editAccountUsername.username }));


            setNewUsername("");
            setShowUsernameModal(false);
            alert(data.message);
        }
        catch (error) {
            console.log("Failed to update your username", error);
        }
    }

    return (
        <>
            <div className="bg-black/50 absolute h-screen w-full top-0 left-0 flex justify-center items-center">
                <form className="card card-md">
                    <div>
                        <input 
                            type="text" 
                            value={newUsername} 
                            onChange={(e) => setNewUsername(e.target.value)} 
                            placeholder="Enter new username"
                        />
                    </div>
                    <div className="flex flex-row gap-2 mt-4">
                        <button className="btn w-1/2" onClick={handleSaveEdit}>
                            Confirm Change
                        </button>
                        <button 
                            className="btn bg-neutral-400 w-1/2" 
                            onClick={(e) => { e.preventDefault(); setShowUsernameModal(false); }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
