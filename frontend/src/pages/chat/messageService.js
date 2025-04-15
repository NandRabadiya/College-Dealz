// Enhanced messageService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../Api/api";

let stompClient = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 1;
let pendingSubscriptions = [];

export const messageService = {
  connectWebSocket: (onConnected, onDisconnected) => {
    // First, ensure any existing connection is properly closed
    if (stompClient) {
      try {
        if (stompClient.connected) {
          console.log("Disconnecting existing STOMP client before new connection");
          stompClient.disconnect();
        }
        
        if (stompClient.active) {
          console.log("Deactivating existing STOMP client");
          stompClient.deactivate();
        }
      } catch (e) {
        console.error("Error cleaning up existing connection:", e);
      }
      stompClient = null;
      // Clear any pending subscriptions
      pendingSubscriptions = [];
    }
    
    try {
      // Check if JWT token exists
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.error("No JWT token found in localStorage");
        if (onDisconnected) onDisconnected(new Error("No JWT token"));
        return null;
      }
      
      console.log(`Connecting to ${API_BASE_URL}/ws (Attempt ${connectionAttempts + 1})`);
      
      // Use SockJS for wider compatibility
      const socket = new SockJS(`${API_BASE_URL}/ws`);
      
      // Debug the socket state changes
      socket.onopen = function() {
        console.log("SockJS socket opened successfully");
      };
      
      socket.onclose = function(event) {
        console.log(`SockJS socket closed with code: ${event.code}, reason: ${event.reason}`);
      };
      
      socket.onerror = function(error) {
        console.error("SockJS socket error:", error);
      };

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: function(str) {
          if(str.includes("error") || str.includes("failed")) {
            console.error("STOMP: " + str);
          } else {
            console.log("STOMP: " + str);
          }
        },
        onConnect: (frame) => {
          console.log("STOMP client connected successfully", frame);
          connectionAttempts = 0; // Reset on successful connection
          
          // Process any pending subscriptions
          if (pendingSubscriptions.length > 0) {
            console.log(`Processing ${pendingSubscriptions.length} pending subscriptions`);
            pendingSubscriptions.forEach(sub => {
              try {
                sub.execute();
              } catch (err) {
                console.error("Error executing pending subscription:", err);
              }
            });
            pendingSubscriptions = [];
          }
          
          if (onConnected) onConnected();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          if (onDisconnected) onDisconnected(new Error(`STOMP error: ${frame.headers?.message || "Unknown error"}`));
        },
        onWebSocketClose: (event) => {
          console.log(`WebSocket connection closed with code: ${event.code}, reason: ${event.reason}`);
          
          // Handle reconnection logic
          if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
            connectionAttempts++;
            console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(() => {
              messageService.connectWebSocket(onConnected, onDisconnected);
            }, 3000 * connectionAttempts); // Exponential backoff
          } else {
            console.error("Max reconnection attempts reached");
            if (onDisconnected) onDisconnected(new Error("Max reconnection attempts reached"));
          }
        },
      });

      console.log("Activating STOMP client");
      stompClient.activate();
      return stompClient;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      if (onDisconnected) onDisconnected(error);
      return null;
    }
  },

  // Subscribe to a chat topic with more robust error handling and user-specific channels
  subscribeToChat: (chatId, onMessageReceived) => {
    // Get current user ID from local storage or session
    const currentUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    
    if (!currentUserId) {
      console.error("No user ID found in storage");
      return {
        unsubscribe: () => console.log("Dummy unsubscribe for missing user ID")
      };
    }
    
    console.log(`Attempting to subscribe to /user/${currentUserId}/queue/chat/${chatId}`);
    
    if (!stompClient) {
      console.warn("STOMP client not initialized, queueing subscription");
      const pendingSub = {
        execute: () => messageService.subscribeToChat(chatId, onMessageReceived)
      };
      pendingSubscriptions.push(pendingSub);
      return {
        unsubscribe: () => {
          pendingSubscriptions = pendingSubscriptions.filter(s => s !== pendingSub);
          console.log("Removed pending subscription");
        }
      };
    }
    
    if (!stompClient.connected) {
      console.warn("STOMP client not connected yet, queueing subscription");
      const pendingSub = {
        execute: () => messageService.subscribeToChat(chatId, onMessageReceived)
      };
      pendingSubscriptions.push(pendingSub);
      return {
        unsubscribe: () => {
          pendingSubscriptions = pendingSubscriptions.filter(s => s !== pendingSub);
          console.log("Removed pending subscription");
        }
      };
    }

    console.log(`Now subscribing to /user/queue/chat/${chatId}`);
    try {
      // Subscribe to user-specific destination
      const subscription = stompClient.subscribe(`/user/queue/chat/${chatId}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          console.log("Message received for chat", chatId, ":", receivedMessage);
          if (onMessageReceived) {
            onMessageReceived(receivedMessage);
          } else {
            console.error("onMessageReceived callback not provided");
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }, {
        // Add headers if needed for subscription authentication
        Authorization: `Bearer ${localStorage.getItem("jwt")}`
      });
      
      console.log(`Successfully subscribed to /user/${currentUserId}/queue/chat/${chatId}`);
      return subscription;
    } catch (error) {
      console.error(`Error subscribing to /user/${currentUserId}/queue/chat/${chatId}:`, error);
      return {
        unsubscribe: () => console.log("Dummy unsubscribe for failed subscription")
      };
    }
  },

  // Send message via WebSocket - fallback to REST if WebSocket fails
  sendMessage: async (senderId, receiverId, content, chatId) => {
    // Get current date and time in the format expected by the backend
    const now = new Date();
    const createdAt = now.toISOString().split('T')[0]; // Format as yyyy-MM-dd
    const createdTime = now.toTimeString().split(' ')[0]; // Format as HH:mm:ss
    
    // Try WebSocket first
    if (stompClient && stompClient.connected) {
      console.log(`Sending message via WebSocket to chat ${chatId}`);
      const message = {
        senderId,
        receiverId,
        content,
        chatId,
        createdAt,
        createdTime
      };

      try {
        stompClient.publish({
          destination: `/app/chat.sendMessage/${chatId}`,
          body: JSON.stringify(message),
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`
          },
        });
        console.log("Message sent successfully via WebSocket");
        return { id: `ws-${Date.now()}`, ...message };
      } catch (error) {
        console.error("Error sending message via WebSocket:", error);
        // Fall back to REST
        console.log("Falling back to REST API");
        return messageService.sendMessageREST(senderId, receiverId, content, chatId, createdAt, createdTime);
      }
    } else {
      // WebSocket not connected, use REST
      console.log("WebSocket not connected, using REST API");
      return messageService.sendMessageREST(senderId, receiverId, content, chatId, createdAt, createdTime);
    }
  },

  // REST API fallback for sending messages with improved error handling
  sendMessageREST: async (senderId, receiverId, content, chatId, createdAt, createdTime) => {
    try {
      console.log(`Sending message via REST API to chat ${chatId}`);
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          content,
          chatId,
          createdAt,
          createdTime
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("REST API error response:", errorText);
        throw new Error(`Failed to send message via REST API: ${response.status} - ${errorText}`);
      }
      
      // Handle empty response case
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        console.log("Empty response from server, treating as success");
        return { 
          id: `rest-${Date.now()}`,
          senderId,
          receiverId,
          content,
          chatId,
          createdAt,
          createdTime,
          success: true 
        };
      }
      
      // Try to parse as JSON, return text if not valid JSON
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not valid JSON:", responseText);
        return { 
          id: `rest-${Date.now()}`,
          senderId,
          receiverId, 
          content,
          chatId,
          createdAt,
          createdTime,
          success: true, 
          text: responseText 
        };
      }
    } catch (error) {
      console.error("Error sending message via REST:", error);
      throw error;
    }
  },

  // Disconnect WebSocket
  disconnect: () => {
    if (stompClient) {
      try {
        if (stompClient.connected) {
          console.log("Disconnecting active STOMP client");
          stompClient.disconnect();
        }
        
        if (stompClient.active) {
          console.log("Deactivating active STOMP client");
          stompClient.deactivate();
        }
        
        stompClient = null;
        connectionAttempts = 0;
        pendingSubscriptions = [];
        console.log("WebSocket disconnected and reset");
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      }
    }
  },

  // Check if WebSocket is connected
  isConnected: () => {
    return stompClient && stompClient.connected;
  }
};
