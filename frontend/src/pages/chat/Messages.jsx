import React, { useState } from "react";
import Chat from "./Chat";
import ChatList from "./ChatList";

const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Pane: Conversation List */}
      <div className="w-1/3 border-r border-gray-700">
        <ChatList onSelectConversation={setSelectedUserId} />
      </div>

      {/* Right Pane: Chat */}
      <div className="w-2/3 flex flex-col">
        {selectedUserId ? (
          <Chat selectedUserId={selectedUserId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
