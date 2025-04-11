import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatList from "./ChatList";
import Chat from "./Chat";
import { MessageCircle } from "lucide-react";

const ChatContainer = () => {
  const { chatId: urlChatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState(urlChatId);
  const navigate = useNavigate();

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    navigate(`/chats/${chatId}`, { replace: true });
  };

  const handleBackClick = () => {
    setSelectedChatId(null);
    navigate("/chats");
  };

  const isMobileView =
    typeof window !== "undefined" && window.innerWidth < 1024;
  const showChatOnMobile = isMobileView && selectedChatId;

  return (
    <div className="h-[90vh] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row w-full">
          {/* Chat list panel */}
          <div
            className={`
              ${showChatOnMobile ? "hidden" : "h-full"} 
              lg:flex lg:w-1/3 lg:max-w-sm 
              border-r border-border/60 overflow-hidden
            `}
          >
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChatId}
            />
          </div>

          {/* Chat panel */}
          <div
            className={`
              ${showChatOnMobile ? "h-full" : "hidden"} 
              lg:flex lg:flex-1 overflow-hidden
            `}
          >
            {selectedChatId ? (
              <Chat chatId={selectedChatId} onBackClick={handleBackClick} />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium">Select a chat</h3>
                  <p className="text-sm mt-1">
                    Choose a conversation from the list
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;