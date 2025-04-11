import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "./chatService";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { chatId: urlChatId } = useParams();

  const currentUserId = localStorage.getItem("userId");
  const activeChatId = selectedChatId || urlChatId;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!currentUserId) {
          navigate("/Authenticate", { state: { from: "/chats" } });
          return;
        }

        const chatsData = await chatService.getUserChats(currentUserId);
        setChats(chatsData);
        setFilteredChats(chatsData);
        
        // If we have chats but no selected chat, select the first one on large screens
        if (chatsData.length > 0 && !activeChatId && window.innerWidth >= 1024) {
          onChatSelect && onChatSelect(chatsData[0].chatId);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
          title: "Error",
          description: "Failed to load chats. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId, navigate, toast, activeChatId, onChatSelect]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat => {
        const otherUser = chat.senderId === currentUserId ? chat.receiverName : chat.senderName;
        return (
          otherUser.toLowerCase().includes(query) ||
          (chat.productName && chat.productName.toLowerCase().includes(query))
        );
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, currentUserId]);

  const handleChatClick = (chatId) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    } else {
      navigate(`/chats/${chatId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="p-3 border-b border-border/60 bg-card sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-3">Chats</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            type="text"
            placeholder="Search chats..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No chats yet</h3>
            <p className="text-muted-foreground mt-1">
              When you start a conversation with a seller, it will appear here.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChatId && chat.chatId.toString() === activeChatId.toString();
            const otherUserName = chat.senderId == currentUserId ? chat.receiverName : chat.senderName;
            const lastMessage = chat.lastMessage;
            
            return (
              <div 
                key={chat.chatId} 
                className={cn(
                  "py-3 px-4 border-b border-border/30 cursor-pointer transition-colors duration-150",
                  isActive ? "bg-primary/10" : "hover:bg-muted/50"
                )}
                onClick={() => handleChatClick(chat.chatId)}
              >
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-primary">
                      {otherUserName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{otherUserName}</h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    {lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        No messages yet
                      </p>
                    )}
                    
                    {chat.productId && (
                      <div className="mt-2">
                        <span className="text-xs bg-muted/60 dark:bg-muted/40 px-2 py-0.5 rounded-full max-w-[200px] truncate inline-block">
                          About: {chat.productName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;