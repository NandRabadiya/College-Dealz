import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { messageService } from "./messageService";
import { chatService } from "./chatService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const productId = queryParams.get("productId");
  const receiverIdFromQuery = queryParams.get("receiverId"); // Assuming you're passing this too

  const [chatId, setChatId] = useState(useParams().chatId || null);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const subscription = useRef(null);
  const { toast } = useToast();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const currentUserId = user.id;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        let finalChatId = chatId;

        // If chatId is not present, create a new chat
        if (!finalChatId && receiverIdFromQuery && productId) {
          const response = await chatService.createChat({
            senderId: currentUserId,
            receiverId: receiverIdFromQuery,
            productId: productId,
          });
          finalChatId = response.chatId;
          setChatId(finalChatId);
          console.log("New chat created with ID:", finalChatId);
        }

        if (!finalChatId) {
          throw new Error("Chat ID not found");
        }

        // Fetch chat details
        const chatData = await chatService.getChatById(finalChatId);
        setChat(chatData);

        // Fetch messages
        const messagesData = await messageService.getChatMessages(finalChatId);
        setMessages(messagesData);

        setChatStarted(messagesData.length > 0);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast({
          title: "Error",
          description: "Unable to load chat.",
          variant: "destructive",
        });
        navigate("/chats");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  }, [chatId, currentUserId, receiverIdFromQuery, productId, navigate, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let stompClientInstance = null;

    const onConnected = () => {
      if (!chatId) {
        console.warn("chatId not available yet. Will wait...");
        return;
      }

      const onMessageReceived = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      // Subscribe to the chat topic
      subscription.current = messageService.subscribeToChat(
        chatId,
        onMessageReceived
      );
    };

    const onDisconnected = () => {
      console.log("Disconnected from WebSocket");
    };

    // Connect WebSocket and save the instance
    stompClientInstance = messageService.connectWebSocket(
      onConnected,
      onDisconnected
    );

    return () => {
      // Clean up subscription and WebSocket
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
      messageService.disconnect();
    };
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage) return;

    if (!chatStarted) {
      setChatStarted(true);
    }

    const receiverId =
      chat.senderId === currentUserId ? chat.receiverId : chat.senderId;

    const newMessage = {
      sender: { id: currentUserId },
      receiver: { id: receiverId },
      content: trimmedMessage,
      chatId,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update the UI
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    try {
      await messageService.sendMessage(
        currentUserId,
        receiverId,
        trimmedMessage,
        chatId
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Optionally remove the optimistic message or mark it as failed
    }
  };

  // const startChat = async () => {
  //   if (!chatStarted) {
  //     const receiverId =
  //       chat.senderId === currentUserId ? chat.receiverId : chat.senderId;

  //     try {
  //       await messageService.sendMessage(
  //         currentUserId,
  //         receiverId,
  //         "Hello! I'm interested in your product.",
  //         chatId
  //       );
  //       setChatStarted(true);
  //     } catch (error) {
  //       console.error("Error starting chat:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to start chat. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 />
      </div>
    );
  }

  const otherUser =
    chat?.senderId === currentUserId ? chat.receiver : chat.sender;

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Card className="shadow-md border border-border/60">
        <CardHeader className="border-b border-border/60 p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chats")}
              className="rounded-full h-8 w-8"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{otherUser?.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {chat?.product?.name ? `About: ${chat.product.name}` : ""}
                </span>
                {chat?.product?.price && (
                  <span className="text-xs bg-muted dark:bg-muted/40 px-1.5 py-0.5 rounded">
                    ₹{chat.product.price}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col h-[60vh] overflow-hidden">
            {/* Product Preview */}
            {chat?.product && (
              <div className="p-3 border-b border-border/60 bg-muted/30">
                <div className="flex items-center space-x-3">
                  {chat.product.imageUrls && chat.product.imageUrls[0] && (
                    <img
                      src={chat.product.imageUrls[0]}
                      alt={chat.product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{chat.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₹{chat.product.price}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender.id === currentUserId}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>

        {chatStarted && (
          <CardFooter className="border-t border-border/60 p-3">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send size={18} />
              </Button>
            </form>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Chat;
