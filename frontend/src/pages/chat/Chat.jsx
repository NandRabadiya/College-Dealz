import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { ArrowLeft, Send, Loader2, WifiOff } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, isYesterday, parseISO, isToday } from "date-fns";

const Chat = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("productId");
  const receiverIdFromQuery = queryParams.get("receiverId");
  const [chatId, setChatId] = useState(useParams().chatId || null);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isWebsocketConnected, setIsWebsocketConnected] = useState(false);
  const [usingRESTFallback, setUsingRESTFallback] = useState(false);
  const messagesEndRef = useRef(null);
  const stompSubscription = useRef(null);
  const reconnectTimerRef = useRef(null);
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("userId");

  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const grouped = [];
    let lastDate = null;

    for (let msg of messages) {
      if (!msg) continue;
      
      // Handle different message formats
      let messageDate;
      try {
        if (msg.createdAt && msg.createdTime) {
          messageDate = new Date(`${msg.createdAt}T${msg.createdTime}`);
        } else if (msg.timestamp) {
          messageDate = new Date(msg.timestamp);
        } else {
          messageDate = new Date();
        }
        
        if (isNaN(messageDate.getTime())) {
          messageDate = new Date();
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        messageDate = new Date();
      }

      const sameDay = lastDate && isSameDay(messageDate, lastDate);

      if (!sameDay) {
        grouped.push({
          type: "date",
          date: messageDate,
        });
        lastDate = messageDate;
      }

      grouped.push({
        type: "message",
        message: msg,
      });
    }

    return grouped;
  };

  const formatDate = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMMM yyyy");
  };

const connectWebSocket = useCallback(() => {
  if (!chatId) return;
  
  // Define message handler within the proper scope
  const onMessageReceived = (receivedMessage) => {
    console.log("Message received:", receivedMessage);
    setMessages(prevMessages => {
      // Check if message already exists to prevent duplicates
      const messageExists = prevMessages.some(msg => 
        msg.id === receivedMessage.id || 
        (msg.content === receivedMessage.content && 
         msg.senderId === receivedMessage.senderId &&
         Math.abs(new Date(msg.timestamp || Date.now()) - new Date(receivedMessage.timestamp || Date.now())) < 5000)
      );
      
      if (messageExists) return prevMessages;
      return [...prevMessages, receivedMessage];
    });
  };
  
  const onConnected = () => {
    console.log("Connected to WebSocket and STOMP client is ready");
    setIsWebsocketConnected(true);
    setUsingRESTFallback(false);
    
    // Add a small delay to ensure STOMP client is fully established
    setTimeout(() => {
      // Unsubscribe first if already subscribed
      if (stompSubscription.current) {
        try {
          stompSubscription.current.unsubscribe();
        } catch (e) {
          console.error("Error unsubscribing:", e);
        }
      }
      
      // Now subscribe with the properly defined message handler
      stompSubscription.current = messageService.subscribeToChat(
        chatId,
        onMessageReceived  // This was missing in your code
      );
    }, 500);
  };
  
  const onDisconnected = (error) => {
    console.log("Disconnected from WebSocket:", error);
    setIsWebsocketConnected(false);
    setUsingRESTFallback(true);
    
    // Clear any existing subscription
    if (stompSubscription.current) {
      try {
        stompSubscription.current.unsubscribe();
      } catch(e) {
        console.error("Error unsubscribing:", e);
      }
    }
  };
  
  messageService.connectWebSocket(onConnected, onDisconnected);
}, [chatId]);
  // Initialize chat data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        let finalChatId = chatId;

        // Create a new chat if needed
        if (!finalChatId && receiverIdFromQuery && productId) {
          console.log("Creating new chat...");
          const response = await chatService.createChat(
            currentUserId, 
            receiverIdFromQuery, 
            productId
          );
          finalChatId = response.chatId || response.id;
          setChatId(finalChatId);
          // Update URL without reloading the page
          navigate(`/chats/${finalChatId}`, { replace: true });
        }

        if (!finalChatId) {
          throw new Error("Chat ID not found");
        }

        // Get chat data
        const chatData = await chatService.getChatById(finalChatId);
        setChat(chatData);
        
        // Ensure messages is an array
        const chatMessages = Array.isArray(chatData.messages) ? chatData.messages : [];
        setMessages(chatMessages);
        
        setChatStarted(chatMessages.length > 0);
        
        // Attempt WebSocket connection
        connectWebSocket();
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast({
          title: "Error",
          description: "Unable to load chat. Please try again.",
          variant: "destructive",
        });
        navigate("/chats");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Polling for messages when websocket is not available
    const pollInterval = setInterval(() => {
      if (usingRESTFallback && chatId) {
        console.log("Polling for new messages...");
        chatService.getChatById(chatId)
          .then(chatData => {
            if (chatData && Array.isArray(chatData.messages)) {
              setMessages(chatData.messages);
            }
          })
          .catch(err => console.error("Error polling messages:", err));
      }
    }, 10000); // Poll every 10 seconds

    // Cleanup function
    return () => {
      if (stompSubscription.current) {
        try {
          stompSubscription.current.unsubscribe();
        } catch(e) {
          console.error("Error unsubscribing:", e);
        }
      }
      messageService.disconnect();
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      clearInterval(pollInterval);
    };
  }, [chatId, currentUserId, receiverIdFromQuery, productId, navigate, toast, connectWebSocket, usingRESTFallback]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
const handleSendMessage = async (e) => {
  e.preventDefault();
  const trimmedMessage = messageInput.trim();
  if (!trimmedMessage || isSending) return;
  if (!chatStarted) setChatStarted(true);
  
  setIsSending(true);
  
  // Determine receiver ID
  const receiverId = chat && chat.senderId ? 
    (chat.senderId.toString() === currentUserId ? chat.receiverId : chat.senderId) :
    receiverIdFromQuery;

  if (!receiverId) {
    toast({
      title: "Error",
      description: "Cannot determine message recipient",
      variant: "destructive",
    });
    setIsSending(false);
    return;
  }

  const now = new Date();
  const createdAt = now.toISOString().split('T')[0]; // Format as yyyy-MM-dd
  const createdTime = now.toTimeString().split(' ')[0]; // Format as HH:mm:ss

  // Create temporary message for UI
  const tempMessage = {
    id: `temp-${Date.now()}`,
    senderId: parseInt(currentUserId),
    receiverId: parseInt(receiverId),
    content: trimmedMessage,
    chatId: parseInt(chatId),
    timestamp: now.toISOString(),
    createdAt: createdAt,
    createdTime: createdTime,
    status: "sending",
  };

  // Add to messages state immediately for responsive UI
  setMessages(prev => [...prev, tempMessage]);
  setMessageInput("");

  try {
    // Try to send message (it will use WebSocket if available, otherwise REST)
    const result = await messageService.sendMessage(
      parseInt(currentUserId),
      parseInt(receiverId),
      trimmedMessage,
      parseInt(chatId)
    );
    
    console.log("Message send result:", result);
    
    // Update temp message status to sent
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: "sent", id: result.id || msg.id } 
          : msg
      )
    );
    
  } catch (error) {
    console.error("Failed to send message:", error);
    
    // Update the temporary message to show error status
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: "error" } 
          : msg
      )
    );
    
    toast({
      title: "Error",
      description: "Failed to send message. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSending(false);
  }
};

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Determine other user's name
  const otherUserName = chat && chat.senderId ? 
    (chat.senderId.toString() === currentUserId ? chat.receiverName : chat.senderName) : 
    "Chat";

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
              <h2 className="text-lg font-semibold">{otherUserName}</h2>
              {chat?.productName && (
                <span className="text-xs text-muted-foreground">
                  About: {chat.productName}
                </span>
              )}
              
              {/* Connection status indicator */}
              {usingRESTFallback ? (
                <div className="flex items-center text-xs text-amber-500 mt-1">
                  <WifiOff size={12} className="mr-1" />
                  <span>Using offline mode</span>
                </div>
              ) : !isWebsocketConnected ? (
                <div className="flex items-center text-xs text-amber-500 mt-1">
                  <Loader2 size={12} className="animate-spin mr-1" />
                  <span>Connecting...</span>
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col h-[60vh] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                groupMessagesByDate(messages).map((item, index) => {
                  if (item.type === "date") {
                    return (
                      <div key={`date-${index}`} className="text-center my-4">
                        <span className="text-xs px-3 py-1 bg-muted dark:bg-muted/50 rounded-full text-muted-foreground">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <ChatMessage
                      key={`msg-${index}`}
                      message={item.message}
                      isCurrentUser={
                        item.message.senderId && currentUserId ? 
                        item.message.senderId.toString() === currentUserId : false
                      }
                      status={item.message.status}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 p-3">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
              disabled={isSending}
            />
            <Button type="submit" size="icon" disabled={isSending || !messageInput.trim()}>
              {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={18} />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;