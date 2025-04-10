import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../Api/api";

let stompClient = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const messageService = {
  // Connect to WebSocket
  connectWebSocket: (onConnected, onDisconnected) => {
    // Reset connection if already trying to connect
    if (stompClient && !stompClient.connected && stompClient.active) {
      console.log("STOMP client is activating but not connected yet, deactivating first");
      try {
        stompClient.deactivate();
      } catch (e) {
        console.error("Error deactivating existing client:", e);
      }
      stompClient = null;
    }
    
    // If already connected, just call the callback
    if (stompClient && stompClient.connected) {
      console.log("WebSocket already connected");
      if (onConnected) onConnected();
      return stompClient;
    }

    try {
      // Check if JWT token exists
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.error("No JWT token found in localStorage");
        if (onDisconnected) onDisconnected(new Error("No JWT token"));
        return null;
      }
      
      console.log(`Attempting to connect to ${API_BASE_URL}/ws (Attempt ${connectionAttempts + 1})`);
      
      // First try native WebSocket endpoint if supported
      let socket;
      
      // Use SockJS for wider compatibility
      socket = new SockJS(`${API_BASE_URL}/ws`);
      
      // Debug the socket state changes
      socket.onopen = function() {
        console.log("SockJS socket opened successfully");
      };
      
      socket.onclose = function(event) {
        console.log(`SockJS socket closed with code: ${event.code}, reason: ${event.reason}`);
        
        if (event.code === 1006) {
          console.warn("Abnormal closure - server might have rejected the connection");
        }
      };
      
      socket.onerror = function(error) {
        console.error("SockJS socket error:", error);
      };

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000, // Increased heartbeat intervals
        heartbeatOutgoing: 10000,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function(str) {
          console.log("STOMP: " + str);
        },
        onConnect: (frame) => {
          console.log("STOMP client connected successfully", frame);
          connectionAttempts = 0; // Reset on successful connection
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

  // Subscribe to a chat topic
  subscribeToChat: (chatId, onMessageReceived) => {
    if (!stompClient) {
      console.warn("STOMP client not initialized, message subscription failed");
      return null;
    }
    
    if (!stompClient.connected) {
      console.warn("STOMP client not connected yet, message subscription failed");
      return null;
    }

    console.log(`Subscribing to /topic/chat/${chatId}`);
    try {
      // Subscribe and handle messages
      return stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          console.log("Message received:", receivedMessage);
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
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      return null;
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
      console.log("Sending message via WebSocket");
      const message = {
        senderId,
        receiverId,
        content,
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
        return true;
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
        return { success: true };
      }
      
      // Try to parse as JSON, return text if not valid JSON
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not valid JSON:", responseText);
        return { success: true, text: responseText };
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
        if (stompClient.active) {
          stompClient.deactivate();
          console.log("WebSocket deactivated");
        }
        stompClient = null;
        connectionAttempts = 0;
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