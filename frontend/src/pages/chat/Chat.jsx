import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { messageService } from "./messageService";
import { chatService } from "./chatService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, WifiOff } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, isYesterday, parseISO, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Chat = ({ chatId: propChatId, onBackClick }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("productId");
  const receiverIdFromQuery = queryParams.get("receiverId");
  const [chatId, setChatId] = useState(
    propChatId || useParams().chatId || null
  );
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
  const currentChatIdRef = useRef(chatId);
  const messagesContainerRef = useRef(null);
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("userId");
  const websocketConnectionRef = useRef(false);

  // Update the currentChatIdRef when chatId changes
  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

  // Optimize date formatting with useMemo
  const formatDate = useCallback((date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMMM yyyy");
  }, []);

  const getFullTimestamp = useCallback((msg) => {
    if (msg.timestamp) return new Date(msg.timestamp);
    if (msg.createdAt && msg.createdTime)
      return new Date(`${msg.createdAt}T${msg.createdTime}`);
    return new Date();
  }, []);
  
  // Optimize grouping messages by date with useMemo
  const groupMessagesByDate = useCallback((messages) => {
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
  }, []);

  // Memoize grouped messages to prevent unnecessary re-renders
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages, groupMessagesByDate]);

  // Memoize other user's name for better performance
  const otherUserName = useMemo(() => {
    if (!chat) return "Chat";
    return chat.senderId.toString() === currentUserId
      ? chat.receiverName
      : chat.senderName;
  }, [chat, currentUserId]);

  // Memoize connection status for better performance
  const connectionStatus = useMemo(() => {
    if (usingRESTFallback) {
      return {
        type: "offline",
        icon: <WifiOff size={14} className="mr-1" />,
        text: "Offline mode"
      };
    } else if (!isWebsocketConnected) {
      return {
        type: "connecting",
        icon: <Loader2 size={14} className="animate-spin mr-1" />,
        text: "Connecting..."
      };
    }
    return null;
  }, [usingRESTFallback, isWebsocketConnected]);
  
  const connectWebSocket = useCallback((newChatId) => {
    if (!newChatId) {
      console.warn("Cannot connect WebSocket: No chat ID provided");
      return;
    }

    console.log(`Initializing WebSocket connection for chat ${newChatId}`);
    websocketConnectionRef.current = true;

    const onMessageReceived = (receivedMessage) => {
      console.log(`Message received for chat ${newChatId}:`, receivedMessage);

      // Only process messages for the currently active chat
      if (newChatId !== currentChatIdRef.current) {
        console.log(
          `Ignoring message for inactive chat: ${newChatId} vs current ${currentChatIdRef.current}`
        );
        return;
      }

      if (
        receivedMessage.chatId &&
        receivedMessage.chatId.toString() !== newChatId.toString()
      ) {
        console.warn(
          `Received message for different chat ID: ${receivedMessage.chatId} vs ${newChatId}`
        );
        return;
      }

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => {
          // Check if message IDs match (most reliable method)
          if (msg.id && receivedMessage.id && msg.id === receivedMessage.id) {
            return true;
          }
          
          // If no ID match, check content + sender + approximate time
          if (msg.content === receivedMessage.content && 
              msg.senderId === receivedMessage.senderId) {
            
            try {
              // Convert both timestamps to milliseconds for reliable comparison
              const msgTime = getFullTimestamp(msg).getTime();
              const receivedTime = getFullTimestamp(receivedMessage).getTime();
              
              // Check if timestamps are within 5 seconds of each other
              return Math.abs(msgTime - receivedTime) < 5000;
            } catch (e) {
              // If time comparison fails, fall back to just content + sender match
              // This is less ideal but prevents errors
              console.error("Error comparing message timestamps:", e);
              return true; // Consider it a duplicate if content+sender match but time comparison fails
            }
          }
          
          return false;
        });
      
        if (messageExists) {
          console.log("Duplicate message detected, ignoring");
          return prevMessages;
        }
      
        console.log("Adding new message to state");
        return [...prevMessages, receivedMessage];
      });
    };

    const onConnected = () => {
      console.log(`WebSocket connected successfully for chat ${newChatId}`);

      // Only update connection status if this is still the active chat
      if (newChatId === currentChatIdRef.current) {
        setIsWebsocketConnected(true);
        setUsingRESTFallback(false);
      } else {
        console.log(
          `Connected to inactive chat ${newChatId}, current is ${currentChatIdRef.current}`
        );
      }

      // Clean up any existing subscription
      if (stompSubscription.current) {
        try {
          console.log(
            "Cleaning up existing subscription before creating new one"
          );
          stompSubscription.current.unsubscribe();
          stompSubscription.current = null;
        } catch (e) {
          console.error("Error unsubscribing from existing topic:", e);
        }
      }

      // Add a small delay to ensure WebSocket is ready
      setTimeout(() => {
        if (
          websocketConnectionRef.current &&
          newChatId === currentChatIdRef.current
        ) {
          console.log(`Now subscribing to topic for chat ${newChatId}`);
          stompSubscription.current = messageService.subscribeToChat(
            newChatId,
            onMessageReceived
          );
        } else {
          console.warn(`WebSocket connection was cancelled or chat changed before subscription. 
                       Was connecting to: ${newChatId}, Current: ${currentChatIdRef.current}`);
        }
      }, 500);
    };

    const onDisconnected = (error) => {
      console.log(`WebSocket disconnected for chat ${newChatId}:`, error);

      // Only update UI state if this is still the active chat
      if (newChatId === currentChatIdRef.current) {
        setIsWebsocketConnected(false);
        setUsingRESTFallback(true);
      }

      if (stompSubscription.current) {
        try {
          stompSubscription.current.unsubscribe();
          stompSubscription.current = null;
        } catch (e) {
          console.error("Error unsubscribing on disconnect:", e);
        }
      }
    };

    messageService.connectWebSocket(onConnected, onDisconnected);
  }, [getFullTimestamp]);

  // Effect for handling WebSocket when chatId changes
  useEffect(() => {
    if (!chatId) {
      console.log("No chat ID available, skipping WebSocket setup");
      return;
    }

    console.log(`Chat ID changed to ${chatId}, setting up WebSocket`);

    // Reset connection flag
    websocketConnectionRef.current = false;

    // Clean up any existing connection
    if (stompSubscription.current) {
      try {
        console.log("Unsubscribing from previous chat topic");
        stompSubscription.current.unsubscribe();
        stompSubscription.current = null;
      } catch (e) {
        console.error("Error unsubscribing from previous chat:", e);
      }
    }

    messageService.disconnect();

    // Reset connection status immediately for better UX
    setIsWebsocketConnected(false);

    // Add a short delay before reconnecting
    const setupTimeout = setTimeout(() => {
      // Verify this is still the current chat before connecting
      if (chatId === currentChatIdRef.current) {
        console.log(`Setting up new WebSocket connection for chat ${chatId}`);
        connectWebSocket(chatId);
      } else {
        console.log(
          `Skipping WebSocket setup for old chat ${chatId}, current is ${currentChatIdRef.current}`
        );
      }
    }, 500);

    return () => {
      console.log(`Cleaning up WebSocket for chat ${chatId}`);
      websocketConnectionRef.current = false;
      clearTimeout(setupTimeout);

      if (stompSubscription.current) {
        try {
          stompSubscription.current.unsubscribe();
          stompSubscription.current = null;
        } catch (e) {
          console.error("Error unsubscribing on cleanup:", e);
        }
      }

      messageService.disconnect();
    };
  }, [chatId, connectWebSocket]);

  // Main effect for initializing chat data
  useEffect(() => {
    // Update chatId if it changes from props
    if (propChatId && propChatId !== chatId) {
      console.log(`Updating chatId from props: ${propChatId}`);
      setChatId(propChatId);
      return; // Let the next effect call handle loading the new chat
    }

    const initializeChat = async () => {
      // Clear previous chat data immediately to prevent flicker
      if (chatId) {
        setIsLoading(true);
        setMessages([]); // Clear messages immediately when loading a new chat
        setChat(null); // Clear chat data
      }

      try {
        let finalChatId = chatId;

        if (!finalChatId && receiverIdFromQuery && productId) {
          console.log(
            "Creating new chat with receiverId:",
            receiverIdFromQuery,
            "and productId:",
            productId
          );
          const response = await chatService.createChat(
            currentUserId,
            receiverIdFromQuery,
            productId
          );
          finalChatId = response.chatId || response.id;
          console.log("New chat created with ID:", finalChatId);
          setChatId(finalChatId);
          navigate(`/chats/${finalChatId}`, { replace: true });
          return; // Let the effect triggered by setChatId handle loading
        }

        if (!finalChatId) {
          throw new Error("Chat ID not found");
        }

        // Verify this is still the current chat before loading data
        if (finalChatId !== currentChatIdRef.current) {
          console.log(
            `Aborting load for old chat ${finalChatId}, current is ${currentChatIdRef.current}`
          );
          return;
        }

        console.log(`Fetching chat data for ID: ${finalChatId}`);
        const chatData = await chatService.getChatById(finalChatId);

        // Final check to make sure we're still working with the current chat
        if (finalChatId !== currentChatIdRef.current) {
          console.log(
            `Discarding data for old chat ${finalChatId}, current is ${currentChatIdRef.current}`
          );
          return;
        }

        setChat(chatData);

        const chatMessages = Array.isArray(chatData.messages)
          ? chatData.messages
          : [];
        console.log(
          `Loaded ${chatMessages.length} messages for chat ${finalChatId}`
        );
        setMessages(chatMessages);
        setChatStarted(chatMessages.length > 0);
      } catch (error) {
        console.error("Error initializing chat:", error);

        // Only show error if this is still the current chat
        if (chatId === currentChatIdRef.current) {
          toast({
            title: "Error",
            description: "Unable to load chat. Please try again.",
            variant: "destructive",
          });
          if (!onBackClick) navigate("/chats");
        }
      } finally {
        // Only update loading state if this is still the current chat
        if (chatId === currentChatIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    if (chatId || (receiverIdFromQuery && productId)) {
      initializeChat();
    }

    // Setup polling for fallback
    const pollInterval = setInterval(() => {
      if (usingRESTFallback && chatId && chatId === currentChatIdRef.current) {
        console.log(`Polling for new messages in chat ${chatId}...`);
        chatService
          .getChatById(chatId)
          .then((chatData) => {
            // Verify this is still the current chat before updating
            if (chatId !== currentChatIdRef.current) {
              console.log(`Discarding polled data for old chat ${chatId}`);
              return;
            }

            if (chatData && Array.isArray(chatData.messages)) {
              setMessages(chatData.messages);
            }
          })
          .catch((err) => console.error("Error polling messages:", err));
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [
    chatId,
    propChatId,
    currentUserId,
    receiverIdFromQuery,
    productId,
    navigate,
    toast,
    onBackClick,
    usingRESTFallback,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || isSending) return;

    // Verify we're still in the same chat
    if (chatId !== currentChatIdRef.current) {
      console.log(
        `Aborting send for old chat ${chatId}, current is ${currentChatIdRef.current}`
      );
      return;
    }

    if (!chatStarted) setChatStarted(true);

    setIsSending(true);

    // Determine receiver ID
    const receiverId =
      chat && chat.senderId
        ? chat.senderId.toString() === currentUserId
          ? chat.receiverId
          : chat.senderId
        : receiverIdFromQuery;

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
    const createdAt = now.toISOString().split("T")[0]; // Format as yyyy-MM-dd
    const createdTime = now.toTimeString().split(" ")[0]; // Format as HH:mm:ss

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
    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");

    try {
      // Final check before sending
      if (chatId !== currentChatIdRef.current) {
        console.log(`Aborting message send for old chat ${chatId}`);
        return;
      }

      console.log(`Sending message to chat ${chatId}`);
      // Try to send message (it will use WebSocket if available, otherwise REST)
      const result = await messageService.sendMessage(
        parseInt(currentUserId),
        parseInt(receiverId),
        trimmedMessage,
        parseInt(chatId)
      );

      console.log("Message send result:", result);

      // Update temp message status to sent only if we're still in the same chat
      if (chatId === currentChatIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, status: "sent", id: result.id || msg.id }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Only update UI if still in the same chat
      if (chatId === currentChatIdRef.current) {
        // Update the temporary message to show error status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? { ...msg, status: "error" } : msg
          )
        );

        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (chatId === currentChatIdRef.current) {
        setIsSending(false);
      }
    }
  }, [messageInput, isSending, chatId, chat, currentUserId, chatStarted, receiverIdFromQuery, toast]);

  // Loading skeleton component
  const SkeletonLoading = () => (
    <div className="flex flex-col h-full w-full">
      {/* Skeleton header */}
      <div className="p-3 border-b border-border/60 flex items-center bg-card sticky top-0 z-10 flex-shrink-0">
        <div className="h-10 w-10 rounded-full mr-3 flex-shrink-0">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Skeleton messages */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-3 space-y-4">
          <div className="text-center my-3">
            <Skeleton className="h-5 w-20 mx-auto rounded-full" />
          </div>
          
          {/* Simulate a conversation with multiple message types */}
          <div className="flex justify-start">
            <div className="max-w-[70%]">
              <Skeleton className="h-12 w-64 rounded-lg" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="max-w-[70%]">
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="max-w-[70%]">
              <Skeleton className="h-16 w-72 rounded-lg" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="max-w-[70%]">
              <Skeleton className="h-10 w-56 rounded-lg" />
            </div>
          </div>
          
          <div className="text-center my-3">
            <Skeleton className="h-5 w-20 mx-auto rounded-full" />
          </div>
          
          <div className="flex justify-start">
            <div className="max-w-[70%]">
              <Skeleton className="h-14 w-80 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton input */}
      <div className="p-3 border-t border-border/60 bg-card sticky bottom-0 z-10 flex-shrink-0">
        <div className="flex w-full gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );

  // Show skeleton loading state
  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat header - fixed at top */}
      <div className="p-3 border-b border-border/60 flex items-center bg-card sticky top-0 z-10 flex-shrink-0">
        {(onBackClick || window.innerWidth < 1024) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick || (() => navigate("/chats"))}
            className="lg:hidden mr-2 h-8 w-8 rounded-full"
          >
            <ArrowLeft size={18} />
          </Button>
        )}

        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-lg font-semibold text-primary">
            {otherUserName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h2 className="font-medium truncate">{otherUserName}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground flex-shrink-0 ml-2">
              {chat.senderId == currentUserId ? "Buyer" : "Seller"}
            </span>
          </div>

          {chat?.productName && (
            <span className="text-xs text-muted-foreground truncate block mt-1">
              About: {chat.productName}
            </span>
          )}
        </div>

        {/* Connection status indicator */}
        {connectionStatus && (
          <div className="flex items-center text-xs text-amber-500 ml-2">
            {connectionStatus.icon}
            <span className="hidden sm:inline">{connectionStatus.text}</span>
          </div>
        )}
      </div>

      {/* Chat messages - scrollable area */}
      <div
        className="flex-1 overflow-y-auto bg-muted/30"
        ref={messagesContainerRef}
      >
        <div className="p-3 space-y-1 min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((item, index) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${index}`} className="text-center my-3">
                    <span className="text-xs px-2 py-1 bg-muted dark:bg-muted/50 rounded-full text-muted-foreground">
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
                    item.message.senderId && currentUserId
                      ? item.message.senderId.toString() === currentUserId
                      : false
                  }
                  status={item.message.status}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input - fixed at bottom */}
      <div className="p-3 border-t border-border/60 bg-card sticky bottom-0 z-10 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0"
            disabled={isSending || !messageInput.trim()}
          >
            {isSending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;