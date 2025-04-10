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
    // try {
    //   // Check if a chat already exists
    //   const chatExists = await chatService.checkChatExists(
    //     currentUserId,
    //     sellerId,
    //     productId
    //   );

    //   if (chatExists) {
    //     // Get the existing chat
    //     const chats = await chatService.getUserChats(currentUserId);
    //     const existingChat = chats.find(
    //       (chat) => 
    //         (chat.productId === productId) && 
    //         ((chat.senderId === currentUserId && chat.receiverId === sellerId) || 
    //          (chat.senderId === sellerId && chat.receiverId === currentUserId))
    //     );

    //     if (existingChat) {
    //       navigate(`/chats/${existingChat.chatId}`);
    //     } else {
    //       // Create a new chat if somehow it exists but we can't find it
    //       const newChat = await chatService.createChat(currentUserId, sellerId, productId);
    //       navigate(`/chats/${newChat.chatId}`);
    //     }
    //   } else {
    //     // Create a new chat
    //   }
      
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
      onClick={handleChatClick}
      className="flex items-center gap-2"
      disabled={isLoading}
    >
      <MessageCircle size={18} />
      {isLoading ? "Loading..." : "Chat with Seller"}
    </Button>
  );
};

export default ChatInitiator;