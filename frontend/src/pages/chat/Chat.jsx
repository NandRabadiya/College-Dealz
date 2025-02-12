import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const jwt = localStorage.getItem("jwt");
const socket = io("http://localhost:8080", {
  query: {
    token: jwt,
  },
}); // Change to your backend WebSocket server URL
socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
const Chat = ({ selectedUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!selectedUserId) return;

    // Join the chat room
    socket.emit("joinChat", selectedUserId);

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUserId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: 1, // Replace with actual logged-in user ID
      receiverId: selectedUserId,
      content: newMessage,
      timestamp: new Date(),
    };

    // Emit message to server
    socket.emit("sendMessage", messageData);

    // Update UI optimistically
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-white mb-4">Chat with User {selectedUserId}</h2>
      <div className="flex-1 overflow-y-auto border p-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-gray-700 text-white mb-2 rounded">
            <strong>
              {msg.senderId === 1 ? "You" : `User ${msg.senderId}`}:
            </strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-500 rounded bg-gray-800 text-white"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="ml-2 bg-purple-600 p-2 text-white rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
