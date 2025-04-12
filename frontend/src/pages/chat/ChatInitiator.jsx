import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { chatService } from "./chatService";
import { useToast } from "@/hooks/use-toast";

const ChatInitiator = ({ productId, sellerId, currentUserId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChatClick = async (e) => {
    // Stop event propagation to prevent parent card click
    e.stopPropagation();
    
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please login to start a chat with the seller",
        variant: "destructive",
      });
      navigate("/Authenticate", { state: { from: window.location.pathname } });
      return;
    }

    if (currentUserId === sellerId) {
      toast({
        title: "Cannot chat with yourself",
        description: "This is your own product listing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
  
    try{
      const chat = await chatService.createChat(currentUserId, sellerId, productId);
      navigate(`/chats/${chat.chatId}`);
    } catch (error) {
      console.error("Error initiating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
    variant="ghost"
    size="sm"
    onClick={handleChatClick}
    className="w-full h-7 px-1 py-0 text-xs text-foreground hover:bg-muted"
    disabled={isLoading}
  >
    <MessageCircle className="mr-1 h-3 w-3 text-inherit" />
    {isLoading ? "Loading..." : "Chat with Seller"}
  </Button>
  
  
  );
};

export default ChatInitiator;