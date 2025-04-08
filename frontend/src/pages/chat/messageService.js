
import axios from "axios";
import { API_BASE_URL } from "../Api/api";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

let stompClient = null;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  },
});

export const messageService = {
  // Get messages from a specific chat
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

  // Send a message via REST API
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

  // Connect to WebSocket for real-time messaging
  connectWebSocket: (onMessageReceived) => {
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("WebSocket connected");
    }, (error) => {
      console.error("WebSocket connection error:", error);
    });

    return stompClient;
  },

  // Subscribe to a specific chat channel
  subscribeToChat: (chatId, onMessageReceived) => {
    if (!stompClient || !stompClient.connected) {
      console.error("STOMP client not connected");
      return null;
    }

    const subscription = stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
      const receivedMessage = JSON.parse(message.body);
      onMessageReceived(receivedMessage);
    });

    return subscription;
  },

  // Send a message via WebSocket
  sendMessageViaWebSocket: (chatId, senderId, receiverId, content) => {
    if (!stompClient || !stompClient.connected) {
      console.error("STOMP client not connected");
      return;
    }

    const message = {
      senderId,
      receiverId,
      content,
    };

    stompClient.send(`/app/chat.sendMessage/${chatId}`, {}, JSON.stringify(message));
  },

  // Disconnect WebSocket
  disconnect: () => {
    if (stompClient) {
      stompClient.disconnect();
    }
  },
};
