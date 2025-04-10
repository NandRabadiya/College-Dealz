import axios from "axios";
import { API_BASE_URL } from "../Api/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  },
});

export const messageService = {
  // Fetch messages for a given chat
  getChatMessages: async (chatId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/messages/chats/${chatId}/messages`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      throw error;
    }
  },

  // Send a message using REST fallback
  sendMessage: async (senderId, receiverId, content, chatId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/messages/send`,
        {
          senderId,
          receiverId,
          content,
          chatId,
        },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Connect and initialize STOMP WebSocket
  connectWebSocket: (onConnected, onDisconnected) => {
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");
        if (onConnected) onConnected();
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        if (onDisconnected) onDisconnected();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();
  },

  // Subscribe to a specific chat topic
  subscribeToChat: (chatId, onMessageReceived) => {
    if (!stompClient || !stompClient.connected) {
      console.warn("Waiting for STOMP to connect before subscribing...");
      return null;
    }

    return stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
      const receivedMessage = JSON.parse(message.body);
      onMessageReceived(receivedMessage);
    });
  },

  // Send a message through WebSocket
  sendMessageViaWebSocket: (chatId, senderId, receiverId, content) => {
    if (!stompClient || !stompClient.connected) {
      console.warn("WebSocket not connected. Try reconnecting.");
      return;
    }

    const message = {
      senderId,
      receiverId,
      content,
    };

    stompClient.publish({
      destination: `/app/chat.sendMessage/${chatId}`,
      body: JSON.stringify(message),
    });
  },

  // Disconnect WebSocket
  disconnect: () => {
    if (stompClient && stompClient.active) {
      stompClient.deactivate();
      console.log("WebSocket deactivated");
    }
  },
};
