// MessagesPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
} from "firebase/firestore";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDZUVChTTWtGm4R40wMWGrTYwyUk0FDahs",
  authDomain: "sklepaga-8790e.firebaseapp.com",
  projectId: "sklepaga-8790e",
  storageBucket: "sklepaga-8790e.firebasestorage.app",
  messagingSenderId: "815409129057",
  appId: "1:815409129057:web:9f6342be47e28c1f69ec20",
  measurementId: "G-9GH707G2WZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function MessagesPage() {
  // --- User info from localStorage ---
  const user = JSON.parse(localStorage.getItem("account"));
  if (!user) {
    window.location.href = "/"; // redirect if not authenticated
  }

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  // --- Fetch conversations in real-time ---
  useEffect(() => {
    const q = query(collection(db, "message"), orderBy("time", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
    });

    return () => unsub();
  }, []);

  // --- Auto-scroll to latest message ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConv]);

  // --- Handle sending a reply ---
  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    const newReply = {
      author: user.name,
      text: replyText.trim(),
      time: new Date().toISOString(),
      status: "sent",
    };

    const convDoc = doc(db, "message", selectedConv.id);
    await updateDoc(convDoc, { replies: arrayUnion(newReply) });
    setReplyText("");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* --- Left Panel: Conversations --- */}
      <div className="w-full md:w-1/3 border-r border-gray-300 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Conversations</h2>
        {conversations.map((conv) => {
          const latestText =
            conv.replies && conv.replies.length > 0
              ? conv.replies[conv.replies.length - 1].text
              : conv.message;
          const isSelected = selectedConv?.id === conv.id;
          return (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                isSelected ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {conv.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{conv.name}</p>
                  <p className="text-gray-500 text-sm truncate">{latestText}</p>
                </div>
                <div className="text-gray-400 text-xs">{conv.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Right Panel: Selected Conversation --- */}
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-lg">{selectedConv.name}</h3>
              <span className="text-gray-400 text-sm">{selectedConv.time}</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {/* Main message */}
              <div className="max-w-md p-3 bg-indigo-100 rounded shadow">
                <p className="font-semibold">{selectedConv.name}</p>
                <p>{selectedConv.message}</p>
                <span className="text-xs text-gray-500">{selectedConv.time}</span>
              </div>

              {/* Replies */}
              {selectedConv.replies &&
                selectedConv.replies
                  .sort((a, b) => new Date(a.time) - new Date(b.time))
                  .map((reply, idx) => {
                    const isUser = reply.author === user.name;
                    return (
                      <div
                        key={idx}
                        className={`max-w-md p-3 rounded shadow ${
                          isUser ? "bg-green-100 self-end" : "bg-white self-start"
                        }`}
                      >
                        <p className="font-semibold">{reply.author}</p>
                        <p>{reply.text}</p>
                        <span className="text-xs text-gray-500">{reply.time}</span>
                      </div>
                    );
                  })}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Reply Input */}
            <form
              onSubmit={sendReply}
              className="p-4 border-t bg-white flex space-x-2"
            >
              <input
                type="text"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
