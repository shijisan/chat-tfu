import { useState, useEffect } from 'react';
import { LuUsers, LuSend, LuX, LuUserPlus} from "react-icons/lu"

export default function InviteContactsButton({ meetId, currentPeerId }) {
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState(new Set());

  // Fetch user's contacts when modal opens
  useEffect(() => {
    if (showModal) {
      fetchContacts();
    }
  }, [showModal]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (contactId, friendName) => {
    setSendingTo(prev => new Set([...prev, contactId]));
    
    try {
      // Create meeting invitation message
      const inviteMessage = `🎥 Join my video meeting!\n\nMeeting ID: ${meetId}\nJoin link: https://chat-tfu.vercel.app/meet/${meetId}?peerId=${generatePeerId()}\n\nClick the link to join the call!`;
      
      // Send message using your existing API
      const response = await fetch(`/api/messages/${contactId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inviteMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invite');
      }

      alert(`Invite sent to ${friendName}!`);
    } catch (error) {
      console.error('Error sending invite:', error);
      alert(`Failed to send invite to ${friendName}. Please try again.`);
    } finally {
      setSendingTo(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
    }
  };

  // Generate a unique peer ID for the invitee
  const generatePeerId = () => {
    return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <>
      {/* Invite Button */}
      <button
        onClick={() => setShowModal(true)}
        className="btn bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center gap-2 transition-all"
      >
        <LuUserPlus size={20} />
        Invite Contacts
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 m-0">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LuUsers size={24} />
                Invite Contacts
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LuX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading contacts...</span>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LuUsers size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No contacts found</p>
                  <p className="text-sm">Add some friends to invite them to meetings!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Send meeting invitations to your contacts:
                  </p>
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {contact.friend?.name?.charAt(0)?.toUpperCase() || contact.friend?.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.friend?.name || contact.friend?.email || 'Unknown'}
                          </p>
                          {contact.friend?.email && contact.friend?.name && (
                            <p className="text-sm text-gray-500">{contact.friend.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => sendInvite(contact.id, contact.friend?.name || contact.friend?.email)}
                        disabled={sendingTo.has(contact.id)}
                        className="btn bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {sendingTo.has(contact.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <LuSend size={16} />
                            Send Invite
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-600">
                <p>📋 Meeting ID: <span className="font-mono bg-white px-2 py-1 rounded">{meetId}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}