import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "./chatService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const{user, isAuthenticated} = useSelector((state) => state.auth);

  const currentUserId = user.id;

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
  }, [currentUserId, navigate, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat => {
        const otherUser = chat.senderId === currentUserId ? chat.receiver : chat.sender;
        return (
          otherUser.name.toLowerCase().includes(query) ||
          (chat.product && chat.product.name.toLowerCase().includes(query))
        );
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, currentUserId]);

  const handleChatClick = (chatId) => {
    navigate(`/chats/${chatId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Card className="shadow-md border border-border/60">
        <CardHeader className="border-b border-border/60 p-4">
          <div className="flex flex-col space-y-3">
            <h1 className="text-2xl font-bold">Your Chats</h1>
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
        </CardHeader>
        
        <CardContent className="p-0 divide-y divide-border/60">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No chats yet</h3>
              <p className="text-muted-foreground mt-1">
                When you start a conversation with a seller, it will appear here.
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const otherUserName = chat.senderId === currentUserId ? chat.receiverName : chat.senderName;
              const lastMessage = chat.lastMessage;
              
              return (
                <div 
                  key={chat.chatId} 
                  className="py-4 px-5 hover:bg-muted/40 cursor-pointer transition-colors duration-150"
                  onClick={() => handleChatClick(chat.chatId)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">{otherUserName.charAt(0).toUpperCase()}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{otherUserName}</h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                     
                      
                      {chat.productId && (
                        <div className="mt-2 flex items-center">
                          <span className="text-xs bg-muted/60 dark:bg-muted/40 px-2 py-0.5 rounded-full mr-2 max-w-[200px] truncate">
                            About: {chat.productName}
                          </span>
                         
                        </div>
                      )}
                       {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatList;
