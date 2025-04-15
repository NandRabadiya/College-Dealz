import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "./chatService";
import { MessageCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Fetch chats data
  const fetchChats = useCallback(async () => {
    try {
      const chatsData = await chatService.getUserChats(currentUserId);

      // Add lastMessage from the messages array and check for unread messages
      const chatsWithLastMessage = chatsData.map((chat) => {
        const messages = chat.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
             
        return { ...chat, lastMessage };
      });

      setChats(chatsWithLastMessage);
      setFilteredChats(chatsWithLastMessage);

      // Auto-select first chat on large screens if no chat selected
      if (
        chatsWithLastMessage.length > 0 &&
        !activeChatId &&
        window.innerWidth >= 1024
      ) {
        onChatSelect && onChatSelect(chatsWithLastMessage[0].chatId);
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
  }, [currentUserId, activeChatId, onChatSelect, toast]);

  useEffect(() => {
    if (currentUserId) {
      fetchChats();
    } else {
      setIsLoading(false);
    }
  }, [currentUserId, fetchChats]);

  // Use memoized filtered chats
  useMemo(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter((chat) => {
        const otherUser =
          chat.senderId === currentUserId ? chat.receiverName : chat.senderName;
        return (
          otherUser.toLowerCase().includes(query) ||
          (chat.productName && chat.productName.toLowerCase().includes(query))
        );
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, currentUserId]);

  const handleChatClick = useCallback((chatId) => {
        
    if (onChatSelect) {
      onChatSelect(chatId);
    } else {
      navigate(`/chats/${chatId}`);
    }
  }, [navigate, onChatSelect]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="p-3 border-b border-border/60 bg-card sticky top-0 z-10 flex-shrink-0">
          <h1 className="text-xl font-bold mb-3">Chats</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5,6].map((i) => (
            <div key={i} className="py-3 px-4 border-b border-border/30 flex items-start space-x-3">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-3 border-b border-border/60 bg-card sticky top-0 z-10 flex-shrink-0">
        <h1 className="text-xl font-bold mb-3">Chats</h1>
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
            const isActive =
              activeChatId &&
              chat.chatId.toString() === activeChatId.toString();
            const otherUserName =
              chat.senderId == currentUserId
                ? chat.receiverName
                : chat.senderName;
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
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          "font-medium truncate")}>
                          {otherUserName}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground">
                          {chat.senderId == currentUserId ? "Seller" : "Buyer"}
                        </span>
                      </div>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(
                            new Date(`${lastMessage.createdAt}T${lastMessage.createdTime}`),
                            { addSuffix: true }
                          )}
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
                        <span className="text-xs bg-muted/90 dark:bg-muted/50 px-2 py-0.5 rounded-full max-w-[200px] truncate inline-block">
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