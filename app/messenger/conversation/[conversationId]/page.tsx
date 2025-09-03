"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  decryptMessage,
  encryptMessage,
  signMessage,
  verifyMessage,
} from "@/lib/messageCryptoUtils";
import { usePrivateKey } from "@/context/PrivateKeyContext";
import { usePublicKey } from "@/context/PublicKeyContext";
import type { ConversationMember } from "@prisma/client";
import Image from "next/image";
import { EllipsisVertical } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Sender = {
  id: string;
  name?: string | null;
  image?: string | null;
  conversationMember: ConversationMember[];
};

type Message = {
  id: string;
  senderId: string;
  senderCipherText?: string;
  recipientCipherText?: string;
  createdAt?: string;
  sender: Sender;
  senderSignature: string;
  recipientSignature: string;
};

type MessageWithDecrypted = Message & {
  decryptedContent?: string;
  verified?: boolean;
};

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messageContent, setMessageContent] = useState("");
  const [convoMessages, setConvoMessages] = useState<MessageWithDecrypted[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const { privateKey } = usePrivateKey();
  const { publicKey: currentUserPublicKey } = usePublicKey();
  const [toggleMessageMenu, setToggleMessageMenu] = useState<string | null>(null);

  const groupedMessages: { sender: string; messages: MessageWithDecrypted[] }[] = [];

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!messageContent.trim()) return;
    if (!recipientPublicKey || !currentUserPublicKey) return;

    try {
      const recipientCipherObj = await encryptMessage(messageContent, recipientPublicKey);
      const senderCipherObj = await encryptMessage(messageContent, currentUserPublicKey);

      if (!recipientCipherObj || !senderCipherObj || !privateKey) {
        console.error("Missing recipientCipherObj/senderCipherObj/privateKey");
        return;
      }

      const messageSignature = await signMessage(
        senderCipherObj.ciphertext,
        recipientCipherObj.ciphertext,
        privateKey
      );

      const sendRes = await fetch(`/api/messenger/conversations/${conversationId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientCipherText: recipientCipherObj.ciphertext,
          senderCipherText: senderCipherObj.ciphertext,
          messageSignature,
        }),
      });

      if (!sendRes.ok) throw new Error(`Failed to send message: ${sendRes.status}`);

      setMessageContent("");
      fetchConvoMessages();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Group messages for UI
  for (let i = 0; i < convoMessages.length; i++) {
    const msg = convoMessages[i];
    const prev = convoMessages[i - 1];

    const isSameSender = prev?.senderId === msg.senderId;
    const withinTime = prev
      ? new Date(msg.createdAt || "").getTime() - new Date(prev.createdAt || "").getTime() <
        5 * 60 * 1000
      : false;

    if (isSameSender && withinTime) {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    } else {
      groupedMessages.push({ sender: msg.senderId, messages: [msg] });
    }
  }

  // decrypt and verify in same helper
  const decryptWithContext = useCallback(
    async (msg: Message): Promise<MessageWithDecrypted> => {
      if (!privateKey || !currentUserId) return msg;

      // choose which ciphertext is relevant to currentUser (same logic as decrypt)
      const cipherText =
        msg.senderId === currentUserId ? msg.senderCipherText : msg.recipientCipherText;

      if (!cipherText) return msg;

		const plain = await decryptMessage(cipherText, privateKey);

      // choose signature corresponding to chosen cipherText
      const signatureB64 = msg.senderId === currentUserId ? msg.senderSignature : msg.recipientSignature;

      // choose public key to verify with:
      // if message was sent by current user -> use currentUserPublicKey
      // else -> use recipientPublicKey (the other user's public key fetched earlier)
      const pubKeyToUse = msg.senderId === currentUserId ? currentUserPublicKey : recipientPublicKey;

      let verified = false;
      try {
        // only attempt verify if we have signature and a public key
        if (pubKeyToUse && signatureB64 && cipherText) {
          const v = await verifyMessage(cipherText, signatureB64, pubKeyToUse);
          verified = v === true;
        }
      } catch (err) {
        console.error("Verification error for message", msg.id, err);
      }

      return { ...msg, decryptedContent: plain, verified };
    },
    [privateKey, currentUserId, currentUserPublicKey, recipientPublicKey]
  );

  // add params for messagecount to optimize
  const fetchConvoMessages = useCallback(
    async () => {
      try {
        if (currentUserId) {
          const res = await fetch(`/api/messenger/conversations/${conversationId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageCount: 0, userId: currentUserId }),
          });

          if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);

          const data = await res.json();
          const rawMessages: Message[] = data?.data ?? data?.fetchedMessages ?? [];
          const decryptedMessages = await Promise.all(rawMessages.map(decryptWithContext));

          setConvoMessages((prev) => {
            const merged = [...decryptedMessages, ...prev];
            const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());
            return unique;
          });
        }
      } catch (err) {
        console.error("Error fetching conversation messages:", err);
      }
    },
    [conversationId, currentUserId, decryptWithContext]
  );

  // Fetch current user
  useEffect(() => {
    if (!conversationId) return;

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/account/user");
        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);

        const data = await res.json();
        setCurrentUserId(data?.user?.id ?? "");
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, [conversationId]);

  // Fetch recipient public key
  useEffect(() => {
    if (!conversationId) return;

    const fetchRecipientPublicKey = async () => {
      try {
        const res = await fetch(`/api/messenger/conversations/${conversationId}/get-public-key`);

        if (!res.ok) throw new Error(`Failed to fetch recipient public key: ${res.status}`);

        const data = await res.json();
        if (data.recipientPublicKey) setRecipientPublicKey(data.recipientPublicKey);
      } catch (err) {
        console.error("Failed to fetch recipient public key", err);
      }
    };

    fetchRecipientPublicKey();
  }, [conversationId]);

  // Fetch conversation messages
  useEffect(() => {
    fetchConvoMessages();
  }, [fetchConvoMessages]);

  // Decrypt any pending messages when private key or user changes
  useEffect(() => {
    if (!privateKey || !currentUserId) return;
    if (!convoMessages.length) return;

    const decryptPending = async () => {
      const needDecrypt = convoMessages.filter((m) => !m.decryptedContent || typeof m.verified === "undefined");
      if (!needDecrypt.length) return;

      const updated = await Promise.all(convoMessages.map(decryptWithContext));
      setConvoMessages(updated);
    };

    decryptPending();
  }, [privateKey, currentUserId, convoMessages, decryptWithContext]);

  return (
    <>
      <main className="bg-accent w-full flex-1 flex flex-col">
        <ul className="flex-1 flex flex-col-reverse gap-4 py-6 md:px-8 px-2 overflow-y-auto justify-end w-full">
          {groupedMessages.map((group, groupIndex) => (
            <li key={groupIndex} className="flex flex-col-reverse">
              <div className={`flex items-start gap-3 ${group.sender === currentUserId && "flex-row-reverse"}`}>
                <Image
                  src={group.messages[0]?.sender?.image || "https://placehold.co/32/webp"}
                  alt={group.messages[0]?.sender?.name || "Sender"}
                  height={32}
                  width={32}
                  className={`rounded-full mt-auto size-8 ${group.sender === currentUserId && "hidden"}`}
                />
                <div className="gap-2 flex flex-col-reverse">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-center gap-1 group relative ${group.sender === currentUserId ? "ml-auto" : "flex-row-reverse mr-auto"}`}
                    >
                      <Popover open={toggleMessageMenu === msg?.id} onOpenChange={(open) => setToggleMessageMenu(open ? msg.id : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`hidden ${msg.sender.id === currentUserId && "group-hover:flex"} rounded-full hover:bg-muted-foreground/25 aspect-square size-6! p-0! ${toggleMessageMenu === msg?.id && "flex"}`}
                            onClick={() => { }}
                          >
                            <EllipsisVertical />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="center" side={group.sender === currentUserId ? "left" : "right"}>
                          <div className="flex flex-col">
                            <Button variant="ghost" className="w-full justify-start">Edit</Button>
                            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-white hover:bg-destructive">Delete</Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <div className="flex items-end gap-2">
                        <p className={`p-2 shadow-sm rounded-lg text-sm inline-block w-fit md:max-w-sm max-w-[200px] ${group.sender === currentUserId ? "bg-blue-500 text-white" : "bg-background"}`}>
                          {msg.decryptedContent ?? "(undeciphered)"}
                        </p>

                        {/* verification badge */}
                        {typeof msg.verified !== "undefined" ? (
                          <span
                            title={msg.verified ? "Signature verified" : "Signature could not be verified"}
                            className="text-xs self-end opacity-80"
                          >
                            {msg.verified ? "✅" : "⚠️"}
                          </span>
                        ) : (
                          <span className="text-xs self-end opacity-50">…</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-muted-foreground text-xs mb-2">
                {group.messages.length > 0
                  ? new Date(group.messages[group.messages.length - 1].createdAt ?? "").toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No messages"}
              </p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSendMessage} className="px-4 py-3 flex items-center gap-2">
          <div className="w-full">
            <label hidden>Message Input</label>
            <Input
              className="bg-background w-full"
              type="text"
              name="MessageInput"
              placeholder="Send a message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <Button
              variant="default"
              type="submit"
              disabled={!recipientPublicKey || !currentUserPublicKey || !messageContent.trim()}
            >
              Send
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
